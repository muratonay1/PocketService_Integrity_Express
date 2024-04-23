import { PocketLib } from "../constants.js";
const {
     execute,
     PocketLog,
} = PocketLib;

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const GenerateOTP = execute(async (criteria) => {
     try {
          const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
          let otp = '';
          for (let i = 0; i < 6; i++) {
               const index = Math.floor(Math.random() * 6);
               otp += chars[index];
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