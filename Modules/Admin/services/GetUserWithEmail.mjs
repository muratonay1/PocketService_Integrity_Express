import { MongoQueryFrom , PocketLib} from "../constants.js";
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
const GetUserWithEmail = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "email");

          let filter = new PocketQueryFilter();
          filter.add("email", criteria.get("email", String)).operator("==");

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.USERS,
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          if (searchResult.length === 0) {
               let messageString = criteria.email + " email adresine kayıtlı bir kullanıcı bulunamadı.";
               PocketLog.info(messageString);
               return {};
          }
          return searchResult[0];
     } catch (error) {
          PocketLog.error("GetUserWithEmail servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});

export default GetUserWithEmail;