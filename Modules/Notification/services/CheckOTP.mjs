import PocketLog from "../../../pocket-core/PocketLog.js";
import PocketMongo from "../../../pocket-core/PocketMongo.js";
import Pocket from "../../../pocket-core/Pocket.js";
import PocketQueryFilter from "../../../pocket-core/PocketQueryFilter.js";
import PocketService, { execute } from "../../../pocket-core/PocketService.js";
import { GeneralKeys, Modules, MongoQueryFrom, Status } from "../constants.js";
import nodemailer from 'nodemailer';
import PocketUtility from "../../../pocket-core/PocketUtility.js";

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const CheckOTP = execute(async (criteria) => {
     try {

          PocketService.parameterMustBeFill(criteria, GeneralKeys.USER_ID);
          PocketService.parameterMustBeFill(criteria, GeneralKeys.OTP);

          const OTP_DATA = "otpData";

          let searchUserObject = Pocket.create();
          searchUserObject.put(GeneralKeys.USER_ID, criteria.get(GeneralKeys.USER_ID, String));
          const userResponse = await PocketService.executeService("GetUserService", Modules.ADMIN, criteria);

          if (PocketUtility.isEmptyObject(userResponse.data)) {
               throw new Error("Kullanici bulunamadi");
          }

          const otpData = await PocketService.executeService("GetOTP", Modules.NOTIFICATION, criteria);

          let otpResponse = otpData.data;

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
async function updateOTP(otpResponse) {
     return await PocketService.executeService("UpdateOTP", Modules.NOTIFICATION, otpResponse);
}
export default CheckOTP;