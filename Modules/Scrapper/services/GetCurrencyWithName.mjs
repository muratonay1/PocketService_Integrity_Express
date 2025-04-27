import { MongoQueryFrom, Operator, PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket GetCurrencyWithName servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const GetCurrencyWithName = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "currency_name");


          let filter = new PocketQueryFilter();
          filter.add("currency_name", criteria.get("currency_name", String)).operator(Operator.EQ);
          filter.add("status","1").operator(Operator.EQ);

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.CURRENCY,
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
          PocketLog.error(`GetCurrencyWithName servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default GetCurrencyWithName;