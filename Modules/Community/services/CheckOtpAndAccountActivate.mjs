import { PocketLib } from "../constants.js";
const {  PocketLog, PocketService, execute, Pocket } = PocketLib;

/**
 * Pocket CheckOtpAndAccountActivate servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const CheckOtpAndAccountActivate = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "email,otp");

          // serviceResponse objesi içerisinde `data` objesi içinde response bulunur.
          let otpRequest = Pocket.create();
          otpRequest.put("email",criteria.email);
          otpRequest.put("otp",criteria.otp);
          const checkOtpResponse = await PocketService.executeService(`CheckOTP`,`Notification`,otpRequest);

          if(!checkOtpResponse.data.otpValidation){
               throw new Error("Otp doğrulanamadı. Lütfen otp doğrulama kodunu girin.");
          }

          let updateUserRequest = Pocket.create();
          updateUserRequest.put("email",criteria.email);
          updateUserRequest.put("params.userActive",true);
          const responseUpdateUser = await PocketService.executeService(`UpdateUserWithEmail`,`Community`,updateUserRequest);

          return responseUpdateUser.data;
     } catch (error) {
          PocketLog.error(`CheckOtpAndAccountActivate servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default CheckOtpAndAccountActivate;