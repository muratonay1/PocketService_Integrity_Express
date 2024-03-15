import PocketLog from "../../../pocket-core/PocketLog.js";
import PocketMongo from "../../../pocket-core/PocketMongo.js";
import PocketQueryFilter from "../../../pocket-core/PocketQueryFilter.js";
import PocketService, { execute } from "../../../pocket-core/PocketService.js";
import { MongoQueryFrom } from "../constants.js";

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const SearchCustomerByUserName = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "username");

          let dbClient = new PocketMongo();
          let filter = new PocketQueryFilter();
          filter.add("username", criteria.get("username", String)).operator("==");

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.CUSTOMER,
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
          PocketLog.error("SearchCustomerByUserName servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});

export default SearchCustomerByUserName;