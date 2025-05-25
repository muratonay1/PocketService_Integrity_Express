import { dbClient } from "../core/PocketMongo.js";
import { execute } from "../core/PocketService.js";
import  PocketLog  from "../core/PocketLog.js";
import  Pocket  from "../core/Pocket.js";
/**
 * Pocket SaveServiceLog servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const SaveServiceLog = execute(async (criteria) => {
     try {
          let saveServiceLog = Pocket.create();
          if (criteria.params != undefined) saveServiceLog.put("params", criteria.params);
          saveServiceLog.put("response", criteria.response);
          saveServiceLog.put("service", criteria.service);
          saveServiceLog.put("module", criteria.module);
          saveServiceLog.put("source", criteria.source)
          saveServiceLog.put("insertDate", criteria.insertDate);

          const insertResult = await new Promise((resolve, reject) => {
               dbClient.executeInsert({
                    from: "pocket.service",
                    params: saveServiceLog,
                    done: resolve,
                    fail: reject
               });
          });
          return insertResult;
     } catch (error) {
          PocketLog.error(`SaveServiceLog servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default SaveServiceLog;