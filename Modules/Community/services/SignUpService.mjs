import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket, PocketUtility } = PocketLib;

/**
 * Pocket SignUpService servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const SignUpService = execute(async (criteria) => {
     try {

          PocketService.parameterMustBeFill(criteria, "email,password,confirmPassword");

          const { password, confirmPassword, email } = criteria;

          PocketUtility.isValidEmail(email);

          if(password != confirmPassword) throw new Error("password not matched");

          // serviceResponse objesi içerisinde `data` objesi içinde response bulunur.
          let searchUserPocket = Pocket.create();
          searchUserPocket.put("userMail",email);
          const serviceResponse = await PocketService.executeService(`GetUserWithEmail`,`Community`,searchUserPocket);
          if(!PocketUtility.isEmptyObject(serviceResponse.data)){
               let text = email + " adresi ile üyelik oluşturulamaz.";
               throw new Error(text);
          }



          let userPocket = Pocket.create();
          userPocket.put("userMail",email);
          userPocket.put("userPassword",password);
          userPocket.put("createDate",PocketUtility.GetRealDate());
          userPocket.put("createTime",PocketUtility.GetRealTime());
          userPocket.put("createTimeStamp",PocketUtility.TimeStamp());
          userPocket.put("createFormatDate",PocketUtility.LoggerTimeStamp());
          userPocket.put("userId",PocketUtility.GenerateOID());

          userPocket.put("emailVerified",false);
          userPocket.put("userActive",false);
          userPocket.put("lastLoginDate",PocketUtility.GetRealDate());
          userPocket.put("lastLoginTime",PocketUtility.GetRealTime());
          userPocket.put("lastLoginTimeStamp",PocketUtility.TimeStamp());
          userPocket.put("loginCount",0);
          userPocket.put("lastLoginIp",criteria.ip);

          // serviceResponse objesi içerisinde `data` objesi içinde response bulunur.
          const saveResponse = await PocketService.executeService(`SaveUserService`,`Community`,userPocket);

          if(!saveResponse.data){
               throw new Error("Kullanici kaydetme islemi hatali gerceklesti.");
          }

          // serviceResponse objesi içerisinde `data` objesi içinde response bulunur.
          let notification = Pocket.create();
          notification.put("email",email);
          notification.put("userId",userPocket.get("userId",String));
          const notificationResponse = await PocketService.executeService(`SendNotificationCode`,`Notification`,notification);

          if(notificationResponse.data){
               return userPocket;
          }

          throw new Error("Kullanici kayit işlemi hata aldı");


     } catch (error) {
          PocketLog.error(`SignUpService servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default SignUpService;