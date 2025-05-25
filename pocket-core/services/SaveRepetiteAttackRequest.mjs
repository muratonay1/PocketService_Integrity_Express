import { MongoQueryFrom, PocketLib } from "../util/constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket SaveRepetiteAttackRequest servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const SaveRepetiteAttackRequest = execute(async (criteria) => {
     try {

          // insertResult success:true, fail:false
          const insertResult = await new Promise((resolve, reject) => {
               dbClient.executeInsert({
                    from: MongoQueryFrom.COMPLIANCE_REQUEST,
                    params: criteria,
                    done: resolve,
                    fail: reject
               });
          });

          if (!insertResult) {
               throw new Error("SaveRepetiteAttackRequest save action failed.");
          }
          return insertResult;
     } catch (error) {
          PocketLog.error(`SaveRepetiteAttackRequest servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default SaveRepetiteAttackRequest;