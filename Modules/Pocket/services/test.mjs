import { PocketLib } from "../constants.js";
const { Pocket, PocketService, PocketLog, PocketUtility, PocketQueryFilter, dbClient, execute } = PocketLib;

/**
 * @summary Pocket test servisi.
 * @description Bu servisin ne yaptığını açıklayan kısa bir metin.
 * @param {Pocket} criteria - Servise gelen ve doğrulanacak parametreleri içeren nesne.
 * @returns {Promise<object>}
 */
const test = execute(async (criteria) => {
     // try bloğu, servis içindeki tüm hataları yakalamak için önerilir.
     try {
          // --- 1. Adım: Parametre Doğrulama Kuralları ---
          const validationRules = {
               "id": {
                    required: true,
                    notEmpty: true,
                    type: PocketService.parameterType.NUMBER,
                    alias: "userId"
               },
               "email": {
                    required: true,
                    validator: PocketUtility.isValidEmail
               }
          };

          // --- 2. Adım: Doğrulama ve Değişken Atama ---
          const { userId, email } = PocketService.serviceParameterValidate(criteria, validationRules);

          // --- 3. Adım: Servis Mantığı ---
          PocketLog.info(`Servis çalıştırıldı. Kullanıcı ID: userId`);

          // Örnek: Başka bir servisi çağırma
          const otherServiceParams = new Pocket().put('id', userId);
          const otherServiceResponse = await PocketService.executeService('OtherServiceName', 'OtherModule', otherServiceParams);

          // Örnek: Veritabanından direkt veri çekme (Promise yapısıyla)
          const filter = new PocketQueryFilter();
          filter.add('userId', userId).operator('==');
          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: "DB_NAME.COLLECTION_NAME",
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          if (searchResult.length === 0) {
               PocketLog.error("No search result");
          }



          // Servis sonucunu döndür.
          return { success: true, message: "İşlem başarılı.", data: searchResult };

     } catch (error) {
          // Hata durumunda, hatayı logla ve yukarıya fırlat.
          PocketLog.error(`test servisinde hata meydana geldi: ${error.message}`);
          throw new Error(error.message);
     }
});

export default test;