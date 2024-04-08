import { MongoQueryFrom, Operator, PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket, PocketUtility } = PocketLib;

/**
 * Pocket SearchMail servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const SearchMail = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "insertDate");

          let filter = new PocketQueryFilter();
          if(criteria.ip != undefined && PocketUtility.)
          filter.add("ip", criteria.get("ip", String)).operator(Operator.EQ);
          filter.add("insertDate", criteria.insertDate).operator(Operator.GTE);

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.MAIL,
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          return searchResult;

     } catch (error) {
          PocketLog.error(`SearchMail servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default SearchMail;