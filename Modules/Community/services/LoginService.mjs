import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService,PocketUtility, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket LoginService servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const LoginService = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "email,password");

          PocketUtility.isValidEmail(criteria.email);

          let searchUserRequest = Pocket.create();
          searchUserRequest.put("userMail",criteria.email);
          searchUserRequest.put("userPassword",criteria.password);
          const responseSearchUser = await PocketService.executeService(`GetUserWithEmail`,`Community`,searchUserRequest);

          if(PocketUtility.isEmptyObject(responseSearchUser.data)){
               PocketLog.error("Kullanici bilgileri boş döndü.");
               throw new Error("Kullanici bilgileri hatali");
          }
          // Şifre kontrolü ile 3 hak ile hesap bloklama işlemi.
          if(responseSearchUser.data.userPassword != criteria.password){
               let error = responseSearchUser.data.userMail + " kullanicisi sifresini yanlis girdi.";
               PocketLog.error(error);
               let updatePocket = Pocket.create();
               updatePocket.put("email",criteria.email);
               if(responseSearchUser.data.handleWrongPassword == undefined){
                    updatePocket.put("params.handleWrongPassword",1);
               }
               else{
                    if(responseSearchUser.data.handleWrongPassword + 1 == 3){
                         updatePocket.put("email", criteria.email);
                         updatePocket.put("params.handleWrongPassword",responseSearchUser.data.handleWrongPassword + 1 );
                         updatePocket.put("params.userActive",false);
                         const updateUserResponse = await PocketService.executeService(`UpdateUserWithEmail`,`Community`,updatePocket);
                         if(updateUserResponse.data){

                              throw new Error("Kullanici hesabı bloklandi. \nLütfen mail adresinize gönderilen doğrulama kodunu kullanarak şifremi unuttum seçeneği ile şifrenizi sıfırlayın.");
                         }
                         PocketLog.error("Kullanici bloklama işlemi sırasında, kullanici güncelleme hata aldı");
                         throw new Error("Kullanici hesabi bloklandi.");
                    }
                    updatePocket.put("params.handleWrongPassword",responseSearchUser.data.handleWrongPassword + 1 );
                    const updateUserResponse = await PocketService.executeService(`UpdateUserWithEmail`,`Community`,updatePocket);
                    throw new Error("Hatali giriş");
               }

               const updateUserResponse = await PocketService.executeService(`UpdateUserWithEmail`,`Community`,updatePocket);
          }

          // serviceResponse objesi içerisinde `data` objesi içinde response bulunur.
          let updateUserPocket = Pocket.create();
          updateUserPocket.put("email",criteria.email);
          updateUserPocket.put("params.lastLoginIp",criteria.ip);
          updateUserPocket.put("params.lastLoginDate",PocketUtility.GetRealDate());
          updateUserPocket.put("params.lastLoginTime",PocketUtility.GetRealTime());
          updateUserPocket.put("params.lastLoginTimeStamp",PocketUtility.TimeStamp());
          updateUserPocket.put("params.loginCount",responseSearchUser.data.loginCount + 1);

          const updateUserResponse = await PocketService.executeService(`UpdateUserWithEmail`,`Community`,updateUserPocket);

          if(updateUserResponse.data){

               let mergedUserObject = Object.assign(responseSearchUser.data,updateUserPocket.params);
               return mergedUserObject;
          }
          throw new Error("Login işlemi sırasında hata");


     } catch (error) {
          PocketLog.error(`LoginService servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default LoginService;