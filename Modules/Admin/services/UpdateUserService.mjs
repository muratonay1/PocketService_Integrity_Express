import { MongoQueryFrom, PocketLib } from "../constants.js";

const {
     Pocket,
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
const UpdateUserService = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "user_id");

          let filter = new PocketQueryFilter();
          filter.add("user_id", criteria.get("user_id", String)).operator("==");

          const updateResult = await new Promise((resolve, reject) => {
               dbClient.executeUpdate({
                    from: MongoQueryFrom.USERS,
                    where: filter,
                    params:criteria,
                    done: resolve,
                    fail: reject
               });
          });

          if (!updateResult) {
               PocketLog.error("UpdateUser : user_id: " + criteria.get("userId", String));
               throw new Error();
          }
          return updateResult;
     } catch (error) {
          PocketLog.error("UpdateUserService servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});

export default UpdateUserService;