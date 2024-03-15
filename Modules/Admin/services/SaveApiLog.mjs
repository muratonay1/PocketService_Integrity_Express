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
const SaveApiLog = execute(async (criteria) => {
     try {

          let dbClient = new PocketMongo();
          let filter = new PocketQueryFilter();

          // insertResult success:true, fail:false
          const insertResult = await new Promise((resolve, reject) => {
               dbClient.executeInsert({
                    from: MongoQueryFrom.API_LOG,
                    params: criteria,
                    done: resolve,
                    fail: reject
               });
          });

          if (!insertResult) {
               PocketLog.error("No search result");
          }
          return insertResult;
     } catch (error) {
          PocketLog.error(`SaveApiLog servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default SaveApiLog;