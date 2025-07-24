import { PocketLib } from "../constants.js";
const { PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket GetUserWithEmail servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const GetUserWithEmail = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "userMail");


          let filter = new PocketQueryFilter();
          filter.add("userMail", criteria.get("userMail", String)).operator("==");
          if(criteria.exist("userActive")) filter.add("userActive", criteria.get("userActive","")).operator("==");


          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: "community.users",
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
          PocketLog.error(`GetUserService servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default GetUserWithEmail;