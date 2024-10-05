import { MongoQueryFrom, Operator, PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket GetBatchCounter servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const GetBatchCounter = execute(async (criteria) => {
     try {

          let filter = new PocketQueryFilter();
          filter.add("unique", "batch_counter").operator(Operator.EQ);

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.COUNT,
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          if (searchResult.length === 0) {
               PocketLog.error("No search result");
          }
          return searchResult[0].counter;
     } catch (error) {
          PocketLog.error(`GetBatchCounter servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default GetBatchCounter;