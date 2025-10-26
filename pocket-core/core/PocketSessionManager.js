import { randomBytes } from 'crypto';
import { PocketLib } from '../util/constants.js'; // Kendi import yolunuza göre düzenleyin
const { PocketLog, dbClient, PocketQueryFilter, PocketToken } = PocketLib;

// Oturumların ne kadar süre geçerli olacağını dakika cinsinden tanımlayın
const SESSION_DURATION_IN_MINUTES = 60 * 24; // 24 saat

/**
 * @summary Kullanıcı oturumlarını (session) merkezi olarak yönetir.
 * @description Oturum oluşturma, doğrulama, sonlandırma ve veritabanı işlemlerini yürütür.
 */
class PocketSessionManager {

     /**
      * @summary Yeni bir kullanıcı oturumu oluşturur ve veritabanına kaydeder.
      * @description Başarılı bir kimlik doğrulamasından sonra çağrılmalıdır.
      * @param {object} options - Oturum oluşturma seçenekleri.
      * @param {object} options.user - Oturum açan kullanıcının veritabanı nesnesi.
      * @param {string} options.ipAddress - İsteği yapan kullanıcının IP adresi.
      * @param {string} options.userAgent - İsteği yapan kullanıcının tarayıcı/cihaz bilgisi.
      * @returns {Promise<string>} Oluşturulan benzersiz oturum token'ı.
      */
     static async create({ user, ipAddress, userAgent }) {
          if (!user || !user._id) {
               throw new Error("Oturum oluşturmak için geçerli bir kullanıcı nesnesi gereklidir.");
          }

          // JWT'nin payload'ına (içeriğine) eklenecek verileri tanımla.
          // Buraya hassas olmayan (şifre gibi) ama oturum boyunca kullanışlı olacak veriler eklenir.
          const payloadData = {
               userId: user._id,
               username: user.username,
               roles: user.roles || [],
               ipAddress,
               userAgent
          };

          // PocketToken sınıfını kullanarak bir SESSION_TOKEN oluştur.
          const sessionToken = await PocketToken.generateAndSaveToken({
               project: , // Proje adınızı buraya yazın
               type: PocketToken.TokenType.SESSION_TOKEN,
               payloadData: payloadData
          });

          PocketLog.info(`Yeni JWT oturumu oluşturuldu. Kullanıcı: ${user.username}`);

          await dbClient.executeInsert({
               from: "admin.sessions", // Oturumları saklamak için yeni bir koleksiyon
               params: sessionRecord
          });

          PocketLog.info(`Yeni oturum oluşturuldu. Kullanıcı: ${user.username}, SessionID: ${sessionId}`);
          return sessionId;
     }

     /**
      * @summary Gönderilen bir oturum token'ının geçerliliğini kontrol eder.
      * @description Korumalı servislerin en başında çağrılmalıdır.
      * @param {string} token - İstemciden gelen oturum token'ı.
      * @returns {Promise<object|null>} Token geçerliyse oturum bilgilerini içeren nesneyi, değilse `null` döndürür.
      */
     static async verify(token) {
          if (!token) {
               return null;
          }

          const filter = new PocketQueryFilter();
          filter.add('sessionId', token).operator('==');

          const results = await dbClient.executeGet({
               from: "admin.sessions",
               where: filter
          });

          if (!results || results.length === 0) {
               PocketLog.warn(`Geçersiz oturum token'ı denemesi: ${token}`);
               return null;
          }

          const session = results[0];

          // 1. Oturum aktif mi? (Logout edilmiş mi?)
          if (!session.isActive) {
               PocketLog.warn(`Pasif bir oturum kullanılmaya çalışıldı. Kullanıcı: ${session.username}`);
               return null;
          }

          // 2. Oturumun süresi dolmuş mu?
          if (new Date() > new Date(session.expiresAt)) {
               PocketLog.warn(`Süresi dolmuş bir oturum kullanılmaya çalışıldı. Kullanıcı: ${session.username}`);
               // Süresi dolan oturumu veritabanında da pasif hale getir (temizlik).
               await this.invalidate(token);
               return null;
          }

          // Tüm kontrollerden geçti, oturum geçerli.
          return session;
     }

     /**
      * @summary Belirli bir oturumu sonlandırır (logout).
      * @param {string} token - Sonlandırılacak oturumun token'ı.
      * @returns {Promise<boolean>} İşlem başarılı olursa `true`.
      */
     static async invalidate(token) {
          const filter = new PocketQueryFilter();
          filter.add('sessionId', token).operator('==');

          const result = await dbClient.executeUpdate({
               from: "admin.sessions",
               where: filter,
               params: { isActive: false },
               upsert: false // Yeni kayıt oluşturma
          });

          PocketLog.info(`Oturum sonlandırıldı. SessionID: ${token}`);
          return result.modifiedCount > 0;
     }

     /**
      * @summary Belirli bir kullanıcının tüm aktif oturumlarını sonlandırır.
      * @description "Tüm cihazlardan çıkış yap" işlevi için kullanılır.
      * @param {string|ObjectId} userId - Oturumları sonlandırılacak kullanıcının ID'si.
      * @returns {Promise<number>} Sonlandırılan oturum sayısı.
      */
     static async invalidateAllForUser(userId) {
          const filter = new PocketQueryFilter();
          filter.add('userId', userId).operator('==');
          filter.add('isActive', true).operator('==');

          const result = await dbClient.executeUpdate({ // Bu metodun updateMany desteklediği varsayılmıştır.
               from: "admin.sessions",
               where: filter,
               params: { isActive: false },
               upsert: false
          });

          const count = result.modifiedCount || 0;
          PocketLog.info(`${count} adet oturum sonlandırıldı. Kullanıcı ID: ${userId}`);
          return count;
     }
}

export default PocketSessionManager;