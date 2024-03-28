import { MongoQueryFrom, PocketLib,GeneralKeys, Operator } from "../constants.js";
const { PocketLog, PocketQueryFilter,  execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket GetBatchJobWithParameter servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const GetBatchJobWithParameter = execute(async (criteria) => {
     try {
          let filter = new PocketQueryFilter();

          filter.add(GeneralKeys.MODULE, criteria.get(GeneralKeys.MODULE, String)).operator(Operator.EQ);
          filter.add(GeneralKeys.HANDLER, criteria.get(GeneralKeys.HANDLER, String)).operator(Operator.EQ);

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.BATCH_DEFINATION,
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          if (searchResult.length === 0) {
               PocketLog.error("No search result");
          }
          return searchResult[0];
     } catch (error) {
          PocketLog.error(`GetBatchJobWithParameter servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default GetBatchJobWithParameter;