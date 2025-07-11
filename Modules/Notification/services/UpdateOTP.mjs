import PocketLog from "../../../pocket-core/core/PocketLog.js";
import PocketMongo from "../../../pocket-core/core/PocketMongo.js";
import PocketQueryFilter from "../../../pocket-core/core/PocketQueryFilter.js";
import PocketService, { execute } from "../../../pocket-core/core/PocketService.js";
import { MongoQueryFrom } from "../constants.js";

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const UpdateOTP = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "otpData._id");

          let dbClient = new PocketMongo();
          let otpData = criteria.otpData;

          let updateFilter = new PocketQueryFilter();
          updateFilter.add("otpData._id",otpData._id).operator("==");

          const result = await new Promise((resolve, reject) => {
               dbClient.executeUpdate({
                    from: MongoQueryFrom.OTP,
                    params:{"otpData":otpData},
                    where: updateFilter,
                    done: resolve,
                    fail: reject
               });
          });

          if(result){
               return true;
          }
          return false;
     } catch (error) {
          PocketLog.error("UpdateOTP servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});

export default UpdateOTP;