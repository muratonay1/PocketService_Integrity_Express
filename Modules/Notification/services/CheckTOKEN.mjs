import { Modules, PocketLib} from "../constants.js";
const {
     Pocket,
     PocketService,
     execute,
     PocketUtility,
     PocketLog
} = PocketLib;
/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const CheckTOKEN = execute(async (criteria) => {
     try {

          PocketService.parameterMustBeFill(criteria,"token");

          let decryptedToken = PocketUtility.decrypt(criteria.get("token",""))
          checkTokenFormat(decryptedToken);

          let userId = decryptedToken.split('--')[0];

          let searchUserObject = Pocket.create();

          searchUserObject.put("userId", userId);

          const userResponse = await PocketService.executeService("GetUserWithUserId", Modules.ADMIN, searchUserObject);

          if (PocketUtility.isEmptyObject(userResponse.data)) {
               throw new Error("Birseyler ters gitti");
          }

          let getTokenParameter = Pocket.create();
          getTokenParameter.put("token",decryptedToken);
          getTokenParameter.put("userId",userId);

          const tokenData = await PocketService.executeService("GetTOKEN", Modules.NOTIFICATION, getTokenParameter);

          let tokenResponse = tokenData.data;

          const expiryTime = addSecondsToTimestamp(tokenResponse.created, tokenResponse.expiredSecond);

          if (isExpired(expiryTime)) {
               tokenResponse.status = "0";
               let updateObject = new Pocket();
               updateObject.put("otpData", tokenResponse);

               await updateTOKEN(updateObject);

               throw new Error("TOKEN verification timed out.");
          }
          tokenResponse.status = "0";
          let updateObject = new Pocket();
          updateObject.put("otpData", tokenResponse);

          const updateOTPResponse = await updateTOKEN(updateObject);

          if (updateOTPResponse) {

               let updateUserPocket = Pocket.create();
               updateUserPocket.put("user_id",userId);
               updateUserPocket.put("email_verified",true);
               updateUserPocket.put("updated_at",PocketUtility.LoggerTimeStamp());

               const updateUserService = await PocketService.executeService("UpdateUserService",Modules.ADMIN,updateUserPocket);

               if(updateUserService.data){
                    return {
                         "success":{"tokenValidation": true}
                    }
               }
          }
          return {
               "fail":{"tokenValidation": false}
          }

     } catch (error) {
          PocketLog.error("CheckTOKEN servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});
function isExpired(expiryTime) {
     const currentTime = new Date().getTime();
     const expiryTimestamp = new Date(expiryTime).getTime();
     return currentTime > expiryTimestamp;
}
function addSecondsToTimestamp(timestamp, seconds) {
     const date = new Date(timestamp);
     date.setSeconds(date.getSeconds() + seconds);
     return date.toISOString();
}
async function updateTOKEN(otpResponse) {
     return await PocketService.executeService("UpdateOTP", Modules.NOTIFICATION, otpResponse);
}

/**
 *
 * @param {String} token
 */
function checkTokenFormat(token) {
     if(
          !token.includes("--") ||
          token.split('--').length != 2 ||
          token.split('-').length != 7 ||
          !token.split('-').includes(''))
     {
          throw new Error("Token uygun formatta degil.")
     }
     return true;

}
export default CheckTOKEN;