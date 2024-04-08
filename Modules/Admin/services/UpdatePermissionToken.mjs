import { MongoQueryFrom, Operator,GeneralKeys, PocketLib } from "../constants.js";
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
const UpdatePermissionToken = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, GeneralKeys.X_USER_TOKEN);

          let filter = new PocketQueryFilter();

          filter.add(GeneralKeys.X_USER_TOKEN, criteria.get(GeneralKeys.X_USER_TOKEN, String)).operator(Operator.EQ);

          criteria.remove(GeneralKeys.X_USER_TOKEN);

     // updateResult success:true, fail:false
     const updateResult = await new Promise((resolve, reject) => {
          dbClient.executeUpdate({
               from: MongoQueryFrom.PERMISSION_TOKEN,
               where: filter,
               params: criteria,
               done: resolve,
               fail: reject
          });
     });

          if (updateResult) {
               return {isUpdate:true};
          }
          return {isUpdate:false};

     } catch (error) {
          PocketLog.error(`UpdatePermissionToken servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default UpdatePermissionToken;