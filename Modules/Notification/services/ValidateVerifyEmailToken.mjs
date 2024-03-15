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
const ValidateVerifyEmailToken = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "token");

          let dbClient = new PocketMongo();
          let filter = new PocketQueryFilter();
          filter.add("token", criteria.get("token", String)).operator("==");

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MONGO_QUERY_FROM_URL,
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
          PocketLog.error("ValidateVerifyEmailToken servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});

export default ValidateVerifyEmailToken;