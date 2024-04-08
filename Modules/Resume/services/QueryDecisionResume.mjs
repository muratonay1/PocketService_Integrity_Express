import { PocketLib, Operator } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket QueryDecisionResume servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const QueryDecisionResume = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "insertDate");

          let filter = new PocketQueryFilter();
          filter.add("insertDate", criteria.get("insertDate", String)).operator(Operator.GTE);

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.DECISION,
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          return searchResult;

     } catch (error) {
          PocketLog.error(`QueryDecisionResume servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default QueryDecisionResume;