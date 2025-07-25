import { Modules, ERROR_MESSAGE, PocketLib } from "../util/constants.js";
const {
     Pocket,
     PocketMongo,
     PocketQueryFilter,
     PocketService,
     execute,
     PocketUtility,
     PocketLog,
     dbClient,
     PocketResponse
} = PocketLib;

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const ControlUserPermissionToken = execute(async (criteria) => {
     try {
          const PERMISSION_TOKEN = "permissionToken";
          PocketService.parameterMustBeFill(criteria, PERMISSION_TOKEN);

          let getTokenCriteria = Pocket.create();
          getTokenCriteria.put(PERMISSION_TOKEN, criteria.get(PERMISSION_TOKEN, String));

          const responsePermission = await PocketService.executeService("GetPermissionToken", "pocket-core", getTokenCriteria);

          let permissionData = responsePermission.data;

          if (!PocketUtility.isValidDate(permissionData.tokenValidDate)) {
               throw new Error(ERROR_MESSAGE.TOKEN_EXPIRED_ERROR_MESSAGE);
          }

          if (permissionData.remainingRequestsLimit == 0) {
               throw new Error(ERROR_MESSAGE.MAX_TOKEN_REQUESTS_ERROR_MESSAGE);
          }

          let updatePocket = Pocket.create();

          updatePocket.put("remainingRequestsLimit", permissionData.remainingRequestsLimit - 1);
          updatePocket.put("updated", PocketUtility.LoggerTimeStamp());
          updatePocket.put("x-user-token", permissionData["x-user-token"]);

          const responseUpdatePermissionToken = await PocketService.executeService("UpdatePermissionToken", "pocket-core", updatePocket);

          return !!(responseUpdatePermissionToken.data.isUpdate);

     } catch (error) {
          //PocketLog.error(`ControlUserPermissionToken servisinde hata meydana geldi.\n` + `Token: ` + criteria.get("permissionToken", String), error);
          PocketResponse.Failure(error);
     }
});

export default ControlUserPermissionToken;