import { MongoQueryFrom, PocketLib } from "../constants.js";

const {
     Pocket,
     PocketQueryFilter,
     execute,
     PocketLog,
     dbClient

} = PocketLib;

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const GetOTP = execute(async (criteria) => {
     try {
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