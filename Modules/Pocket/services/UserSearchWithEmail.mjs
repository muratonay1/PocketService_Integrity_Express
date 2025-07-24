import { Operator, PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket, PocketUtility } = PocketLib;

/**
 * Pocket UserSearch servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const UserSearchWithEmail = execute(async (criteria) => {
     try {

          PocketService.parameterMustBeFill(criteria, "email");

          let filter = new PocketQueryFilter();
          filter.add("email",criteria.email).operator(Operator.EQ);

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: "pocket.ui_user",
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          if (searchResult.length === 0) {
               PocketLog.error("Kullanıcı bulunamadı");
               throw new Error("Kullanıcı bulunamadı.");
          }

          let user = searchResult[0];
          return user;

     } catch (error) {
          PocketLog.error(`UserSearch servisinde hata meydana geldi."` + error);
          throw new Error(error.message);
     }
});

export default UserSearchWithEmail;