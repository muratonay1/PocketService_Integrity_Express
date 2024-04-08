import { ERROR_MESSAGE, MongoQueryFrom, Operator, PocketLib } from "../constants.js";
const {
     Pocket,
     PocketResponse,
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
const GetUserService = execute(async (criteria) => {
     let filter;
     try {

          filter = new PocketQueryFilter();

          createFilter();

          if(filter.filters.length == 0){
               throw new Error(ERROR_MESSAGE.USER_NOT_FOUND_ERROR_MESSAGE)
          }
          const userResponse = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.USERS,
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          if (userResponse.length === 0) {
               throw new Error(ERROR_MESSAGE.USER_NOT_FOUND_ERROR_MESSAGE);
          }


          if(!userResponse[0].email_verified){
               throw new Error(criteria.get("name","") + " kullanicisi icin email dogrulamasi gerekli.");
          }

          return userResponse[0];
     } catch (error) {
          PocketLog.error("GetUserService servisinde hata meydana geldi.", error);
          throw new Error(error);
     }

     function createFilter() {
          if(criteria.exist("name")){
               filter.add("name", criteria.get("name", String)).operator(Operator.EQ);
          }
          if(criteria.exist("userId")){
               filter.add("user_id", criteria.get("userId", String)).operator(Operator.EQ);
          }
     }
});

export default GetUserService;