import { MongoQueryFrom, Operator, PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket GetResumeData servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const GetResumeData = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "key");

          let filter = new PocketQueryFilter();
          filter.add("unique", criteria.get("key", String)).operator(Operator.EQ);

          const searchResult = await new Promise((resolve, reject) => {

               dbClient.executeGet({
                    from: MongoQueryFrom.CV,
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
          PocketLog.error(`GetResumeData servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default GetResumeData;