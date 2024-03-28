import { MongoQueryFrom ,GeneralKeys, Operator, PocketLib, Status} from "../constants.js";
const { PocketLog,  PocketQueryFilter,  execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket GetBatchJobs servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const GetBatchJobs = execute(async (criteria) => {
     try {

          let filter = new PocketQueryFilter();
          filter.add(GeneralKeys.STATUS, Status.ACTIVE).operator(Operator.EQ);

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
          return searchResult;
     } catch (error) {
          PocketLog.error(`GetBatchJobs servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default GetBatchJobs;