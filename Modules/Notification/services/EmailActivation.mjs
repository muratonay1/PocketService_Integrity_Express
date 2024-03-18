import PocketConfigManager from "../../../pocket-core/PocketConfigManager.js";
import PocketLog from "../../../pocket-core/PocketLog.js";
import PocketUtility from "../../../pocket-core/PocketUtility.js";
import Pocket from "../../../pocket-core/Pocket.js";
import PocketService, { execute } from "../../../pocket-core/PocketService.js";
import { MongoQueryFrom ,Modules, Errors} from "../constants.js";

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const EmailActivation = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria,"type,email");
          let subject;
          let type;
          if(criteria.type == "email"){
               subject = 'Pocket Email Activation';
               type = criteria.type;
          }

          let userCriteria = new Pocket();
          userCriteria.put("email",criteria.get("email",""));

          const userResponse = await PocketService.executeService("GetUserWithEmail",Modules.ADMIN,userCriteria)

          if(userResponse.data.email == "" || userResponse.data.email == undefined){
               throw new Error("Kullanıcı e posta bilgisi eksik.");
          }

          // serviceResponse objesi içerisinde `data` objesi içinde response bulunur.
          let otpCriteria = Pocket.create();
          otpCriteria.put("userId",userResponse.data["user_id"]);
          const otpResponse = await PocketService.executeService(`GetOTP`,Modules.NOTIFICATION,otpCriteria);

          if(PocketUtility.isEmptyObject(otpResponse.data) || PocketUtility.isExpiredDate(otpResponse.data.created,otpResponse.data.expiredSecond)){
               throw new Error(Errors.TOKEN_EXPIRED);
          }

          const idServiceResponse = await PocketService.executeService("GenerateUniqueID","Utility");

          const token = userResponse.data.user_id + "--" + PocketUtility.GenerateOID();

          let uniqueId = idServiceResponse.data._id;

          let notificationObject = {
               "otpData":{

                    "_id"               :    uniqueId,
                    "mailTo"            :    userResponse.data.email,
                    "expiredSecond"     :    PocketConfigManager.getTokenExpiredSecond(),
                    "created"           :    PocketUtility.LoggerTimeStamp(),
                    "nickname"          :    userResponse.data.nickname,
                    "userId"            :    userResponse.data.user_id,
                    "retriesNumber"     :    0,
                    "token"             :    PocketUtility.encrypt(token),
                    "type"              :    type,
                    "subject"           :    subject,
                    "status"            :    "1"
               }

          }
          if(type != "email"){
               otpData["otp"] = otp.data.otp;
          }

          const sendOTP = await PocketService.executeService("SendOTP",Modules.NOTIFICATION,notificationObject);

          if(sendOTP.data.sendStatus){

               notificationObject.otpData.token = PocketUtility.decrypt(notificationObject.otpData.token);
               const saveOTP = await PocketService.executeService("SaveOTP",Modules.NOTIFICATION,notificationObject);
               return true;

          }
     } catch (error) {
          PocketLog.error("EmailActivation servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});

export default EmailActivation;