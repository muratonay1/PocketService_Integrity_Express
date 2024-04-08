import { MongoQueryFrom, PocketLib } from "../constants.js";
const {
     Pocket,
     PocketQueryFilter,
     PocketService,
     execute,
     PocketLog,
     dbClient

} = PocketLib;

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const SaveApiLog = execute(async (criteria) => {
     try {
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