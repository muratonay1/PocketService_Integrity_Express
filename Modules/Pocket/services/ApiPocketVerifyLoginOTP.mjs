import { PocketLib } from "../constants.js";
const { execute, Pocket, PocketService, dbClient, PocketQueryFilter, PocketUtility, PocketOtpManager } = PocketLib;

/**
 * Pocket ApiPocketVerifyLoginOTP servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const ApiPocketVerifyLoginOTP = execute(async (criteria) => {

     const validationRules = {
          "otp": { alias: "otp", required: true, notEmpty: true, validator: customerOtpValidator },
          "email": { alias: "email", required: true, notEmpty: true, validator: PocketUtility.isValidEmail },
          "referenceKey": { alias: "referenceKey", required: true, notEmpty: true, validator: referenceKeyValidator }
     };

     let { otp, email, referenceKey } = PocketService.serviceParameterValidate(criteria, validationRules);

     let searchUserParameter = Pocket.create();
     searchUserParameter.put("email", email);

     let user = await PocketService.executeService(`UserSearchWithEmail`, `Pocket`, searchUserParameter);
     user = user.data;

     if (PocketUtility.isEmptyObject(user)) throw new Error(email + " emailin sahip kullanıcı bulunamadı.");
     if (user.status === "0") throw new Error("Pasif kullanıcılarla işlem yapılamaz.");
     if (!user.emailVerified) throw new Error("Lütfen öncelikle E-mail aktivasyon işlemi gerçekleştirin.");
     if (!user["2FacAuth"]) throw new Error("2 Faktörlü Kimlik Doğrulaması kapalı bir kullanıcıda OTP doğrulama işlemi yapılamaz.");

     const responseVerifyOtp = await PocketOtpManager.verify({
          "referenceKey": referenceKey,
          "primaryKey": email,
          "otp": otp
     })

     if (!responseVerifyOtp.success) {
          throw new Error(responseVerifyOtp.message);
     }

     /**
      * Burada session oluşturmak gerekiyor.
      * Eğer aktif bir session varsa -> Aktif oturum bilgisi verilip oturum açma işlemi engellenir.
      * Eğer aktif bir session yoksa -> create() ile yeni bir oturum oluşturulmalı.
      * Not: oluşturulan sessionId ile pocket-ui apilerine istek atılacak. sessionId'yi kopyalaıp başka bir tarayıcıdan gönderildiğinde
      * isteklerin engellenmesi gerekiyor.
      */

     //Kodu buradan yazmaya başlayabilirsin...

     return responseVerifyOtp.success;
});

function customerOtpValidator(otp) {
     if (PocketUtility.isString(otp) && otp.length == 6) {
          return true;
     }
     throw new Error("OTP Kodu custom validasyondan geçemedi.");
}

function referenceKeyValidator(referenceKey) {
     if (referenceKey == "pocket-ui") {
          return true;
     }
     throw new Error("referenceKey custom validasyondan geçemedi.");
}

export default ApiPocketVerifyLoginOTP;