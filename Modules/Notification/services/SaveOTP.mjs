import PocketLog from "../../../pocket-core/core/PocketLog.js";
import PocketMongo from "../../../pocket-core/core/PocketMongo.js";
import PocketQueryFilter from "../../../pocket-core/core/PocketQueryFilter.js";
import PocketService, { execute } from "../../../pocket-core/core/PocketService.js";
import { MongoQueryFrom } from "../constants.js";
import nodemailer from 'nodemailer';

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const SaveOTP = execute(async (criteria) => {
     try {
          let dbClient = new PocketMongo();
          const saveOTPResponse = await new Promise((resolve, reject) => {
               dbClient.executeInsert({
                    from: MongoQueryFrom.OTP,
                    params: criteria,
                    done: resolve,
                    fail: reject
               });
          });

          return !!(saveOTPResponse);

     } catch (error) {
          PocketLog.error("SaveOTP servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});

export default SaveOTP;