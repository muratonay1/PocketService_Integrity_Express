import PocketLog from "../../../pocket-core/core/PocketLog.js";
import Pocket from "../../../pocket-core/core/Pocket.js";
import PocketMongo from "../../../pocket-core/core/PocketMongo.js";
import PocketQueryFilter from "../../../pocket-core/core/PocketQueryFilter.js";
import PocketService, { execute } from "../../../core/pocket-core/PocketService.js";
import { Modules } from "../../Admin/core/constants.js";
import { MongoQueryFrom } from "../constants.js";
import PocketUtility from "../../../pocket-core/core/PocketUtility.js";

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const SendNotificationCode = execute(async (criteria) => {
     try {

          PocketService.parameterMustBeFill(criteria,"email");

          const idServiceResponse = await PocketService.executeService("GenerateUniqueID","Utility");

          // serviceResponse objesi içerisinde `data` objesi içinde response bulunur.
          let searchUserRequest = Pocket.create();
          searchUserRequest.put("userMail",criteria.email);
          const userResponse = await PocketService.executeService(`GetUserWithEmail`,`Community`,searchUserRequest);

          const otp = await PocketService.executeService("GenerateOTP","Notification");

          let uniqueId = idServiceResponse.data._id;

          let notificationObject = {
               "otpData":{

                    "_id"               :    uniqueId,
                    "mailTo"            :    userResponse.data.userMail,
                    "expiredSecond"     :    500,
                    "created"           :    PocketUtility.LoggerTimeStamp(),
                    "nickname"          :    userResponse.data.userId,
                    "userId"            :    userResponse.data.userId,
                    "otp"               :    otp.data.otp,
                    "retriesNumber"     :    0,
                    "status"            :    "1",
                    "type"              :    ""
               }
          }

          const sendOTP = await PocketService.executeService("SendOTP",Modules.NOTIFICATION,notificationObject);

          if(sendOTP.data.sendStatus){

               const saveOTP = await PocketService.executeService("SaveOTP",Modules.NOTIFICATION,notificationObject);
               return true;

          }

          return false;

     } catch (error) {
          PocketLog.error("SendNotificationCode servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});

export default SendNotificationCode;