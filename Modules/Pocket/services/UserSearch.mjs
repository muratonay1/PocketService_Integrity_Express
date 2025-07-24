import { PocketLib } from "../constants.js";
const {  PocketLog,   PocketService, execute, dbClient, Pocket, PocketUtility,PocketQueryFilter } = PocketLib;

/**
 * Pocket UserSearch servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const UserSearch = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "username,password");

          let filter = new PocketQueryFilter();
          filter.add("status", "1").operator("==");
          filter.add("username",criteria.username).operator("==");

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

          if(criteria.password != PocketUtility.decrypt(user.password)){
               PocketLog.error("Şifre hatalı girildi.");
               throw new Error("Şifre hatalı girildi.");
          }

          return prepareReturnUserData(user);

     } catch (error) {
          PocketLog.error(`UserSearch servisinde hata meydana geldi."` + error);
          throw new Error(error.message);
     }
});

function prepareReturnUserData(dbUser){
     let user = Pocket.create();
     user.put("name",         dbUser.name)
     user.put("surname",      dbUser.surname)
     user.put("birthDate",    dbUser.birthDate)
     user.put("avatar",       dbUser.avatar)
     user.put("email",        dbUser.email)
     user.put("emailVerified",dbUser.emailVerified)
     return user;
}

export default UserSearch;