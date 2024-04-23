import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, PocketUtility dbClient, Pocket } = PocketLib;

/**
 * Pocket PasswordResetSendOTP servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const PasswordResetSendOTP = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "email");

          let searchUserReq = Pocket.create();
          searchUserReq.put("email",criteria.email);
          const responseUser = await PocketService.executeService(`GetUserWithEmail`,`Community`,searchUserReq);

          if(PocketUtility.isEmptyObject(responseUser.data)){
               throw new Error("Kullanici bulunamadi.");
          }

          let sendNotificationRequest = Pocket.create();
          sendNotificationRequest.put("email",criteria.email);
          const notificationResponse = await PocketService.executeService(`SendNotificationCode`,`Notification`,sendNotificationRequest);

          console.log(notificationResponse.data);
          return null;
     } catch (error) {
          PocketLog.error(`PasswordResetSendOTP servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default PasswordResetSendOTP;