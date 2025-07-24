import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';
import { dbClient } from './PocketMongo.js';
import PocketLog from './PocketLog.js';
import PocketQueryFilter from './PocketQueryFilter.js';
import { Operator } from '../util/constants.js';

dotenv.config();

/**
 * PocketToken Sınıfı (Veritabanı Destekli)
 * Tek bir token türü yönetir ve token'ları veritabanında takip eder.
 */
class PocketToken {
     static TokenType = {
          LOGIN_VERIFY_EMAIL: "login-verify-email",
          SESSION_TOKEN:"session_token",
     };

     /**
      * Proje ve tür bazında bir token yönetir.
      * Önce geçerli bir token olup olmadığını kontrol eder, yoksa yeni bir tane üretir.
      * @param {object} options - Token oluşturma seçenekleri.
      * @param {string} options.project - Token'ın ait olduğu projenin adı.
      * @param {string} options.type - Token'ın türü veya amacı.
      * @param {object} [options.payloadData={}] - Token payload'una eklenecek ek veriler.
      * @returns {Promise<string|null>} Mevcut veya yeni oluşturulan JWT, hata durumunda null.
      */
     static async generateAndSaveToken({ project, type, payloadData = {}}) {
          try {
               if (!project || !type) {
                    throw new Error("'project' and 'type' parameters are required.");
               }

               // 1. MEVCUT VE GEÇERLİ BİR TOKEN VAR MI DİYE KONTROL ET
               // DÜZELTME: PocketQueryFilter kullanımı, istediğiniz zincirleme (chaining) yapısına uygun hale getirildi.
               const filter = new PocketQueryFilter();
               filter.add("project", project).operator(Operator.EQ);
               filter.add("type", type).operator(Operator.EQ);
               filter.add("isValid", true).operator(Operator.EQ);
               // DÜZELTME: Süresi mevcut zamandan 'büyük olanları' getir (GT: Greater Than).
               filter.add("expiresAt", new Date()).operator(Operator.GT);

               const existingTokenResult = await new Promise((resolve, reject) => {
                    dbClient.executeGet({
                         from: "pocket.token",
                         where: filter,
                         done: resolve,
                         fail: reject
                    });
               });

               // 2. EĞER GEÇERLİ TOKEN BULUNURSA, ONU DÖNDÜR
               if (existingTokenResult && existingTokenResult.length > 0) {
                    PocketLog.info(`Found existing valid token [${existingTokenResult[0].jti}] for project [${project}]. Returning it.`);
                    return existingTokenResult[0].token;
               }

               // 3. EĞER GEÇERLİ TOKEN YOKSA, YENİ BİR TANE ÜRET
               PocketLog.info(`No valid token found for project [${project}]. Generating a new one.`);

               let expiresIn = PocketToken.getTokenExpiresIn(type);

               const jti = randomBytes(16).toString('hex');
               const payload = { project, type, ...payloadData };
               const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn, jwtid: jti });
               const decodedToken = jwt.decode(token);
               const expiresAt = new Date(decodedToken.exp * 1000);

               const tokenRecord = {
                    jti,
                    project,
                    type,
                    expiresAt,
                    payload,
                    isValid: true,
                    createdAt: new Date(),
                    token: token
               };

               // 4. YENİ TOKEN'I VERİTABANINA KAYDET
               await new Promise((resolve, reject) => {
                    dbClient.executeInsert({
                         from: "pocket.token",
                         params: tokenRecord,
                         done: resolve,
                         fail: reject
                    });
               });

               PocketLog.info(`✅ New token [${jti}] saved. Expires: ${expiresAt.toLocaleString()}`);
               return token;

          } catch (error) {
               console.error("Token generation and saving failed:", error.message);
               throw new Error("Token could not be handled.");
          }
     }

     /**
      * Gönderilen token'ı doğrular.
      * Hem JWT imzasını hem de veritabanındaki geçerliliğini kontrol eder.
      * @param {string} token - Doğrulanacak JWT.
      * @returns {Promise<object|null>} Başarılı ise çözülmüş payload, değilse null.
      */
     static async verifyToken(token) {
          try {
               const decoded = jwt.verify(token, process.env.JWT_SECRET);

               if (!decoded.jti) {
                    PocketLog.warn("Token verification failed: 'jti' (JWT ID) not found in token.");
                    return null;
               }

               // DÜZELTME: Veritabanı kontrolü için PocketQueryFilter kullanımı düzeltildi.
               const filter = new PocketQueryFilter();
               filter.add("jti", decoded.jti).operator(Operator.EQ);
               filter.add("isValid", true).operator(Operator.EQ);

               const tokenRecordResult = await new Promise((resolve, reject) => {
                    dbClient.executeGet({
                         from: "pocket.token",
                         where: filter,
                         done: resolve,
                         fail: reject
                    });
               });

               if (!tokenRecordResult || tokenRecordResult.length === 0) {
                    PocketLog.warn(`❌ Token [${decoded.jti}] is valid but has been revoked or not found in DB.`);
                    return null;
               }

               PocketLog.info(`✅ Token verified: [${decoded.jti}]`);
               return decoded;

          } catch (error) {
               throw new Error(`${error.message}`);
          }
     }

     /**
      * Bir token'ı veritabanında geçersiz olarak işaretler (Revoke).
      * @param {string} token - Geçersiz kılınacak JWT.
      * @returns {Promise<boolean>} İşlem başarılı ise true, değilse false.
      */
     static async invalidateToken(token) {
          try {
               const decoded = jwt.decode(token);

               if (!decoded || !decoded.jti) {
                    PocketLog.warn(`Token invalidation failed. Could not decode token or find jti.`);
                    return false;
               }

               // DÜZELTME: PocketMongo sınıfının beklediği gibi, güncellenecek veri doğrudan bir nesne olarak tanımlandı.
               const updateParams = { isValid: false };

               // DÜZELTME: Filtre oluşturma, zincirleme yapıya uygun hale getirildi.
               const filter = new PocketQueryFilter();
               filter.add("jti", decoded.jti).operator(Operator.EQ);

               const updateResult = await new Promise((resolve, reject) => {
                    dbClient.executeUpdate({
                         from: "pocket.token",
                         where: filter,
                         params: updateParams,
                         done: resolve,
                         fail: reject
                    });
               });

               if (updateResult) {
                    PocketLog.info(`🔒 Token revoked successfully: [${decoded.jti}]`);
                    return true;
               } else {
                    // executeUpdate upsert:true ile çalıştığı için bu bloğa genellikle girmez, ama güvenlik için kalabilir.
                    PocketLog.warn(`Token [${decoded.jti}] could not be revoked. Maybe it was not found.`);
                    return false;
               }
          } catch (error) {
               console.error("Token invalidation failed with an exception:", error);
               return false;
          }
     }

     static async isTokenExist(parameters) {
          const { project, type, email, jti } = parameters;

          if (!project || !type || !email || !jti) {
               throw new Error("Zorunlu alanlardan biri eksik veya boş: project, type, email, jti zorunludur.");
          }
          const filter = new PocketQueryFilter();
          filter.add("project", project).operator(Operator.EQ);
          filter.add("type", type).operator(Operator.EQ);
          filter.add("email", email).operator(Operator.EQ);
          filter.add("jti", jti).operator(Operator.EQ);

          const searchExistToken = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: "pocket.token",
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          return searchExistToken;
     }

     static getTokenExpiresIn(tokenType) {
          switch (tokenType) {
               case PocketToken.TokenType.LOGIN_VERIFY_EMAIL:
                    return "3m";
               case PocketToken.TokenType.SESSION_TOKEN:
                    return "20m";
               default:
                    throw new Error("Tanımsız token tipi ile işlem yapılıyor.").stack;
          }
     }
}

export default PocketToken;
