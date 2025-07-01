import { MongoQueryFrom, Operator, PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket FindIpContext servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const FindIpContext = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "ip");

          let filter = new PocketQueryFilter();
          filter.add("ip", criteria.get("ip", String)).operator(Operator.EQ);

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.DECISION,
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
          PocketLog.error(`FindIpContext servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default FindIpContext;