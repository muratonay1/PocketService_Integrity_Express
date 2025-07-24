import PocketConfigManager from "../../../pocket-core/core/PocketConfigManager.js";
import PocketLog from "../../../pocket-core/core/PocketLog.js";
import PocketUtility from "../../../pocket-core/core/PocketUtility.js";
import Pocket from "../../../pocket-core/core/Pocket.js";
import PocketService, { execute } from "../../../pocket-core/core/PocketService.js";
import { Modules, Status } from "../constants.js";

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const SendEmailActivation = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "type,email");
          let subject;
          let type;
          if (criteria.type == "email") {
               subject = 'Pocket Email Activation';
               type = criteria.type;
          }

          let userCriteria = new Pocket();
          userCriteria.put("email", criteria.get("email", ""));

          const userResponse = await PocketService.executeService("GetUserWithEmail", Modules.ADMIN, userCriteria)

          if (userResponse.data.email == "" || userResponse.data.email == undefined) {
               throw new Error("Kullanıcı e posta bilgisi eksik.");
          }

          // serviceResponse objesi içerisinde `data` objesi içinde response bulunur.
          let otpCriteria = Pocket.create();
          otpCriteria.put("userId", userResponse.data["user_id"]);
          const otpResponse = await PocketService.executeService(`GetOTP`, Modules.NOTIFICATION, otpCriteria);


          return otpResponse;

     } catch (error) {
          PocketLog.error("SendEmailActivation servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});

export default SendEmailActivation;