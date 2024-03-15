import PocketLog from "../../../pocket-core/PocketLog.js";
import Pocket from "../../../pocket-core/Pocket.js";
import PocketMongo from "../../../pocket-core/PocketMongo.js";
import PocketQueryFilter from "../../../pocket-core/PocketQueryFilter.js";
import PocketService, { execute } from "../../../pocket-core/PocketService.js";
import { Modules } from "../../Admin/constants.js";
import { MongoQueryFrom } from "../constants.js";
import PocketUtility from "../../../pocket-core/PocketUtility.js";

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const SendNotificationCode = execute(async (criteria) => {
     try {

          PocketService.parameterMustBeFill(criteria,"email,username");

          let userCriteria = new Pocket();
          userCriteria.put("name",criteria.get("username",""));

          const userResponse = await PocketService.executeService("GetUserService",Modules.ADMIN,userCriteria)

          const idServiceResponse = await PocketService.executeService("GenerateUniqueID","Utility");

          const otp = await PocketService.executeService("GenerateOTP","Notification");

          if(userResponse.data.email == "" || userResponse.data.email == undefined){
               throw new Error("Kullanıcı e posta bilgisi eksik.");
          }

          let uniqueId = idServiceResponse.data._id;

          let notificationObject = {
               "otpData":{

                    "_id"               :    uniqueId,
                    "mailTo"            :    userResponse.data.email,
                    "expiredSecond"     :    500,
                    "created"           :    PocketUtility.LoggerTimeStamp(),
                    "nickname"          :    userResponse.data.nickname,
                    "userId"            :    userResponse.data.user_id,
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