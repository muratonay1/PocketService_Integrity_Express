import { randomBytes } from 'crypto';
import { dbClient } from './PocketMongo.js'; // Varsayılan yol, kendi projenize göre düzenleyin
import PocketLog from './PocketLog.js'; // Varsayılan yol
import PocketQueryFilter from './PocketQueryFilter.js'; // Varsayılan yol
import { Operator, Status } from '../util/constants.js'; // Varsayılan yol

// --- Yapılandırma ---
const OTP_DEFAULT_LENGTH = 6;
const OTP_DEFAULT_EXPIRES_IN_SECONDS = 180; // 3 dakika
const OTP_MAX_RETRIES = 3; // 3 yanlış denemeden sonra kilitlenir
const OTP_CHARS = '0123456789'; // Sadece rakamlardan oluşan OTP

/**
 * PocketOtpManager Sınıfı
 * Tek kullanımlık şifre (OTP) işlemlerini merkezi olarak yönetir.
 */
class PocketOtpManager {

     /**
      * Belirtilen anahtarlar için yeni bir OTP oluşturur ve kaydeder.
      * Eğer aynı anahtarlar için aktif bir OTP varsa, önce onu geçersiz kılar.
      * @param {object} options - OTP oluşturma seçenekleri.
      * @param {string} options.primaryKey - OTP'nin gönderileceği ana hedef (örn: email, userId). (Zorunlu)
      * @param {string} options.referenceKey - OTP'nin oluşturulma nedeni (örn: 'login', 'password-reset'). (Zorunlu)
      * @param {number} [options.expiresInSeconds=180] - OTP'nin saniye cinsinden geçerlilik süresi.
      * @param {number} [options.length=6] - Oluşturulacak OTP'nin karakter uzunluğu.
      * @returns {Promise<string>} Oluşturulan OTP kodu.
      */
     static async generate({ primaryKey, referenceKey, expiresInSeconds = OTP_DEFAULT_EXPIRES_IN_SECONDS, length = OTP_DEFAULT_LENGTH }) {
          try {
               if (!primaryKey || !referenceKey) {
                    throw new Error("'primaryKey' ve 'referenceKey' parametreleri zorunludur.");
               }

               // 1. Mevcut aktif OTP'leri geçersiz kıl. Bu fonksiyon artık yeni kayıt oluşturmayacak.
               await this.invalidateByReferenceKeyAndPrimaryKey(primaryKey, referenceKey);

               // 2. Yeni OTP oluştur
               let otp = '';
               for (let i = 0; i < length; i++) {
                    const index = Math.floor(Math.random() * OTP_CHARS.length);
                    otp += OTP_CHARS[index];
               }

               const jti = randomBytes(16).toString('hex');
               const createdAt = new Date();
               const expiresAt = new Date(createdAt.getTime() + expiresInSeconds * 1000);

               const otpRecord = {
                    jti,
                    otp,
                    primaryKey,
                    referenceKey,
                    createdAt,
                    expiresAt,
                    status: Status.ACTIVE,
                    retries: 0,
               };

               // 3. Yeni OTP'yi veritabanına kaydet (SADECE BURADA YENİ KAYIT OLUŞTURULUR)
               await new Promise((resolve, reject) => {
                    dbClient.executeInsert({
                         from: "pocket.otp",
                         params: otpRecord,
                         done: resolve,
                         fail: reject
                    });
               });

               PocketLog.info(`✅ Yeni OTP [${otp}] (primaryKey: [${primaryKey}], referenceKey: [${referenceKey}]) için oluşturuldu. JTI: [${jti}]`);
               return otp;

          } catch (error) {
               PocketLog.error(`OTP oluşturma hatası (primaryKey: ${primaryKey}): ${error.message}`);
               throw new Error("OTP oluşturulamadı.");
          }
     }

     /**
      * Gönderilen OTP'yi doğrular.
      * @param {object} options - OTP doğrulama seçenekleri.
      * @param {string} options.primaryKey - OTP'nin ilişkilendirildiği birincil anahtar.
      * @param {string} options.referenceKey - OTP'nin ilişkilendirildiği referans anahtar.
      * @param {string} options.otp - Kullanıcı tarafından girilen OTP kodu.
      * @returns {Promise<{success: boolean, message: string}>} Doğrulama sonucu.
      */
     static async verify({ primaryKey, referenceKey, otp }) {
          try {
               if (!primaryKey || !referenceKey || !otp) {
                    throw new Error("'primaryKey', 'referenceKey' ve 'otp' parametreleri zorunludur.");
               }

               // 1. Aktif OTP'yi veritabanından bul
               const filter = new PocketQueryFilter();
               filter.add("primaryKey", primaryKey).operator(Operator.EQ);
               filter.add("referenceKey", referenceKey).operator(Operator.EQ);
               filter.add("status", Status.ACTIVE).operator(Operator.EQ);

               // Not: OTP kodunu filtreye eklemiyoruz ki yanlış denemeleri de sayabilelim.
               // Bu nedenle, sorgu birden fazla aktif OTP dönerse en yenisini almalıyız.
               // PocketMongo'da sort desteği varsa eklemek iyi olur: .sort({ createdAt: -1 })
               const results = await new Promise((resolve, reject) => {
                    dbClient.executeGet({
                         from: "pocket.otp",
                         where: filter,
                         done: resolve,
                         fail: reject
                    });
               });

               if (!results || results.length === 0) {
                    PocketLog.warn(`Doğrulama hatası: Aktif OTP bulunamadı (primaryKey: ${primaryKey})`);
                    return { success: false, message: "Invalid or expired OTP." };
               }

               // Her zaman en son oluşturulanı al (eğer sıralama yoksa)
               const otpRecord = results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

               // ... (verify fonksiyonunun geri kalanı aynı)
               if (new Date() > new Date(otpRecord.expiresAt)) {
                    await this.invalidateByJti(otpRecord.jti, "Expired");
                    return { success: false, message: "OTP has expired." };
               }

               if (otpRecord.otp !== otp) {
                    const newRetries = (otpRecord.retries || 0) + 1;
                    if (newRetries >= OTP_MAX_RETRIES) {
                         await this.invalidateByJti(otpRecord.jti, `Max retries exceeded.`);
                         return { success: false, message: "OTP locked due to too many failed attempts." };
                    } else {
                         await this._updateRetries(otpRecord.jti, newRetries);
                         return { success: false, message: "Invalid OTP code." };
                    }
               }

               await this.invalidateByJti(otpRecord.jti, 'Successfully verified.');
               PocketLog.info(`✅ OTP doğrulandı (JTI: ${otpRecord.jti})`);
               return { success: true, message: "OTP verified successfully." };

          } catch (error) {
               PocketLog.error(`OTP doğrulama sırasında kritik hata: ${error.message}`);
               throw new Error("An error occurred during OTP verification.");
          }
     }

     /**
     * GÜNCELLEME: Bu fonksiyonun mantığı, istenmeyen kayıt oluşturma (upsert) sorununu
     * önlemek için tamamen değiştirildi. Artık önce okuma, sonra güncelleme yapıyor.
     * @param {string} primaryKey - OTP'lerin ilişkilendirildiği birincil anahtar.
     * @param {string} referenceKey - OTP'lerin ilişkilendirildiği referans anahtar.
     * @returns {Promise<boolean>} İşlem başarılı ise true.
     */
     static async invalidateByReferenceKeyAndPrimaryKey(primaryKey, referenceKey) {
          const filter = new PocketQueryFilter()
               .add("primaryKey", primaryKey).operator(Operator.EQ)
               .add("referenceKey", referenceKey).operator(Operator.EQ)
               .add("status", Status.ACTIVE).operator(Operator.EQ);

          try {
               // 1. Önce geçersiz kılınacak aktif OTP'leri bul.
               const recordsToInvalidate = await new Promise((resolve, reject) => {
                    dbClient.executeGet({
                         from: "pocket.otp",
                         where: filter,
                         done: resolve,
                         fail: reject
                    });
               });

               // 2. Eğer bulunursa, her birini JTI kullanarak tek tek geçersiz kıl.
               if (recordsToInvalidate && recordsToInvalidate.length > 0) {
                    PocketLog.info(`${recordsToInvalidate.length} adet eski OTP, (primaryKey: ${primaryKey}) için geçersiz kılınıyor.`);
                    const invalidationPromises = recordsToInvalidate.map(record =>
                         this.invalidateByJti(record.jti, "Superseded by new OTP request")
                    );
                    await Promise.all(invalidationPromises);
                    return true;
               }

               // 3. Geçersiz kılınacak kayıt yoksa, hiçbir şey yapma ve başarıyla dön.
               return false;

          } catch (error) {
               PocketLog.error(`Eski OTP'leri geçersiz kılma hatası: ${error.message}`);
               // Bu kritik bir hata olmadığı için akışı durdurmuyoruz, sadece logluyoruz.
               return false;
          }
     }

     // invalidateByJti ve _updateRetries fonksiyonları aynı kalabilir.
     // ...
     /**
      * Bir OTP'yi JTI (benzersiz kimlik) kullanarak geçersiz kılar.
      * @param {string} jti - Geçersiz kılınacak OTP'nin benzersiz kimliği.
      * @param {string} [reason="Manually invalidated"] - Geçersiz kılma nedeni.
      * @returns {Promise<boolean>} İşlem başarılı ise true.
      */
     static async invalidateByJti(jti, reason = "Manually invalidated") {
          const filter = new PocketQueryFilter().add("jti", jti).operator(Operator.EQ);
          const updateParams = { status: Status.PASSIVE, invalidationReason: reason };

          const result = await new Promise((resolve, reject) => {
               dbClient.executeUpdate({
                    from: "pocket.otp",
                    where: filter,
                    params: updateParams,
                    upsert: false, // Güvenlik için buraya da ekleyelim.
                    done: resolve,
                    fail: reject
               });
          });

          if (result) {
               PocketLog.info(`🔒 OTP geçersiz kılındı (JTI: ${jti}, Neden: ${reason})`);
          }
          return !!result;
     }

     /**
      * (Private) Bir OTP'nin deneme sayısını günceller.
      * @param {string} jti - OTP'nin benzersiz kimliği.
      * @param {number} retries - Yeni deneme sayısı.
      * @private
      */
     static async _updateRetries(jti, retries) {
          const filter = new PocketQueryFilter().add("jti", jti).operator(Operator.EQ);
          const updateParams = { retries };

          await new Promise((resolve, reject) => {
               dbClient.executeUpdate({
                    from: "pocket.otp",
                    where: filter,
                    params: updateParams,
                    upsert: false, // Güvenlik için buraya da ekleyelim.
                    done: resolve,
                    fail: reject
               });
          });
     }

}

export default PocketOtpManager;
