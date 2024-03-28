import { MongoQueryFrom, PocketLib } from "../constants.js";
const {  PocketLog, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket SaveServiceInfo servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const SaveServiceInfo = execute(async (criteria) => {
     try {
          // insertResult success:true, fail:false
          const insertResult = await new Promise((resolve, reject) => {
               dbClient.executeInsert({
                    from: MongoQueryFrom.SERVICE,
                    params: criteria,
                    done: resolve,
                    fail: reject
               });
          });
          return insertResult;
     } catch (error) {
          PocketLog.error(`SaveServiceInfo servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default SaveServiceInfo;