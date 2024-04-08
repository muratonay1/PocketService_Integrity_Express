import { MongoQueryFrom, PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket GetSecret servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const GetSecret = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "id");

          let filter = new PocketQueryFilter();
          filter.add("_id", criteria.get("id", String)).operator("==");

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.SECRETS,
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
          PocketLog.error(`GetSecret servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default GetSecret;