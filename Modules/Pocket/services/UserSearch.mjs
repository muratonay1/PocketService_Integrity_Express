import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket, PocketUtility } = PocketLib;

/**
 * Pocket UserSearch servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const UserSearch = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "username,password");

          //TODO:ŞİFRELEME MEKANİZMASI KULLANILACAK

          let filter = new PocketQueryFilter();
          filter.add("status", "1").operator("==");
          filter.add("username",criteria.username).operator("==");

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: "pocket.user",
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          if (searchResult.length === 0) {
               PocketLog.error("No search result : Kullanıcı bulunamadı");
               throw new Error("Kullanıcı bulunamadı.");
          }

          let user = searchResult[0];

          if(criteria.password != PocketUtility.decrypt(user.password)){
               PocketLog.error("No search result : Şifre hatalı girildi.");
               throw new Error("Şifre hatalı girildi.");
          }

          return searchResult[0];
     } catch (error) {
          PocketLog.error(`UserSearch servisinde hata meydana geldi."` + error);
          throw new Error(error.message);
     }
});

export default UserSearch;