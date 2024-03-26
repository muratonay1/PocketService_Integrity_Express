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
const GetOTP = execute(async (criteria) => {
     try {
          let dbClient = new PocketMongo();
          let filter = new PocketQueryFilter();

          filter.add("otpData.status","1").operator("==");
          filter.add("otpData.userId",criteria.get("userId","")).operator("==");

          const userOtpData = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.OTP,
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          return userOtpData;
     } catch (error) {
          PocketLog.error("GetOTP servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});

export default GetOTP;