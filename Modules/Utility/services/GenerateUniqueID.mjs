import PocketLog from "../../../pocket-core/core/PocketLog.js";
import { execute } from "../../../pocket-core/core/PocketService.js";
/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const GenerateUniqueID = execute(async (criteria) => {
     try {
          const timestamp = Date.now(); // Anlık zaman damgası (milisaniye cinsinden)
          const randomChars = Math.random().toString(36).substring(2, 8); // Rastgele karakterler (altı karakter uzunluğunda)
          const uniqueID = `${timestamp}${randomChars}`; // Zaman damgası ile rastgele karakterleri birleştir
          return {"_id":uniqueID};
     } catch (error) {
          PocketLog.error("GenerateUniqueID servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});

export default GenerateUniqueID;