import { MongoQueryFrom, PocketLib } from "../constants.js";
const {
     PocketQueryFilter,
     PocketService,
     execute,
     PocketLog,
     dbClient

} = PocketLib;
/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const GetUserWithUserId = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "userId");

          let filter = new PocketQueryFilter();
          filter.add("user_id", criteria.get("userId", String)).operator("==");

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.USERS,
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
          PocketLog.error("GetUserWithUserId servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});

export default GetUserWithUserId;