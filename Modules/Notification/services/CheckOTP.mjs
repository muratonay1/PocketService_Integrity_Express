import { GeneralKeys, Modules, Status, PocketLib } from "../constants.js";

const {
     Pocket,
     PocketService,
     PocketUtility,
     execute,
     PocketLog,
     dbClient

} = PocketLib;

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const CheckOTP = execute(async (criteria) => {
     try {

          PocketService.parameterMustBeFill(criteria, "email,otp");

          const OTP_DATA = "otpData";

          let searchUserObject = Pocket.create();
          searchUserObject.put("userMail", criteria.get("email", String));

          const userResponse = await PocketService.executeService("GetUserWithEmail", "Community", searchUserObject);

          if (PocketUtility.isEmptyObject(userResponse.data)) {
               throw new Error("Kullanici bulunamadi");
          }


          let searchOtp = Pocket.create();
          searchOtp.put("userId",userResponse.data.userId);
          const otpData = await PocketService.executeService("GetOTP", Modules.NOTIFICATION, searchOtp);

          let otpResponse = otpData.data[0].otpData;

          const expiryTime = addSecondsToTimestamp(otpResponse.created, otpResponse.expiredSecond);

          if (isExpired(expiryTime)) {
               otpResponse.status = Status.PASSIVE;
               let updateObject = new Pocket();
               updateObject.put(OTP_DATA, otpResponse);

               await updateOTP(updateObject);

               throw new Error("OTP verification timed out.");
          }

          if (otpResponse.otp != criteria.get(GeneralKeys.OTP, "")) {
               if (parseInt(otpResponse.retriesNumber) + 1 == 4) {
                    otpResponse.status = Status.PASSIVE;
                    let updateObject = new Pocket();
                    updateObject.put(OTP_DATA, otpResponse);

                    await updateOTP(updateObject);
                    throw new Error("OTP verification process blocked")
               }
               otpResponse.retriesNumber = parseInt(otpResponse.retriesNumber) + 1;
               let updateObject = new Pocket();
               updateObject.put(OTP_DATA, otpResponse);

               await updateOTP(updateObject);
               throw new Error("OTP verification not equals");

          }

          otpResponse.status = Status.PASSIVE;
          let updateObject = new Pocket();
          updateObject.put(OTP_DATA, otpResponse);

          const updateOTPResponse = await updateOTP(updateObject);

          if (updateOTPResponse) {
               return {
                    "otpValidation": true
               }
          }
          return {
               "otpValidation": false
          }

     } catch (error) {
          PocketLog.error("CheckOTP servisinde hata meydana geldi." + error);
          throw new Error(error.stack);
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
async function updateOTP(otpResponse) {
     return await PocketService.executeService("UpdateOTP", Modules.NOTIFICATION, otpResponse);
}
export default CheckOTP;