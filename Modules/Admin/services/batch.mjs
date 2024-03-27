import PocketUtility from "../../../pocket-core/PocketUtility.js";
import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, executeBatch, dbClient, Pocket } = PocketLib;

/**
 * Pocket batch servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const batch = executeBatch(async (criteria) => {
     try {

          let pocket = Pocket.create();
          pocket.put("date",PocketUtility.LoggerTimeStamp());

          // insertResult success:true, fail:false
          const insertResult = await new Promise((resolve, reject) => {
               dbClient.executeInsert({
                    from: "pocket.test",
                    params: pocket,
                    done: resolve,
                    fail: reject
               });
          });

     } catch (error) {
          PocketLog.error(`batch servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default batch;