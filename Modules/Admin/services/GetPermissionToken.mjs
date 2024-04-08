import { ERROR_MESSAGE, GeneralKeys, MongoQueryFrom, Operator, Status, PocketLib } from "../constants.js";
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
const GetPermissionToken = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "permissionToken");

          let filter = new PocketQueryFilter();
          filter.add("x-user-token", criteria.get("permissionToken", String)).operator(Operator.EQ);
          filter.add(GeneralKeys.STATUS, Status.ACTIVE).operator(Operator.EQ);

          const responseTokenInfo = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.PERMISSION_TOKEN,
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          if (responseTokenInfo.length == 0) {
               throw new Error(ERROR_MESSAGE.ACTIVE_TOKEN_NOT_FOUND_ERROR_MESSAGE);
          }
          return responseTokenInfo[0];
     } catch (error) {
          PocketLog.error(`GetPermissionToken servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default GetPermissionToken;