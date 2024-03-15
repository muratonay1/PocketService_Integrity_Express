import PocketLog from "../../../pocket-core/PocketLog.js";
import PocketMongo from "../../../pocket-core/PocketMongo.js";
import PocketQueryFilter from "../../../pocket-core/PocketQueryFilter.js";
import PocketService, { execute } from "../../../pocket-core/PocketService.js";
import { MongoQueryFrom } from "../constants.js";

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const GenerateOTP = execute(async (criteria) => {
     try {
          const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Geçerli karakterler
          let otp = '';
          for (let i = 0; i < 6; i++) {
               const index = Math.floor(Math.random() * 6); // Rastgele karakter seç
               otp += chars[index]; // OTP'ye ekle
          }
          return {
               "otp":otp
          };
     } catch (error) {
          PocketLog.error("GenerateOTP servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});

export default GenerateOTP;