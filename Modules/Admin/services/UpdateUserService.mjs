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
const UpdateUserService = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "user_id");

          let dbClient = new PocketMongo();
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