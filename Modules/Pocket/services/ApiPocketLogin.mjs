import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo,  PocketService, execute, dbClient, Pocket, PocketUtility, PocketMailManager, PocketToken, dotenv } = PocketLib;

/**
 * Pocket ApiPocketLogin servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const ApiPocketLogin = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "username,password");

          let searchUserQuery = Pocket.create();
          searchUserQuery.put("username", criteria.username);
          searchUserQuery.put("password", criteria.password);

          const responseUserService = await PocketService.executeService(`UserSearch`, `Pocket`, searchUserQuery);

          let userData = responseUserService.data;

          if (userData.email == undefined || userData.email == "") {
               throw new Error("Kullanıcının geçerli bir email adres bilgisine ulaşılamadı");
          }

          // EMAİL DOĞRULAMA İŞLEMİ YAPILMADIYSA EMAİL DOĞRULAMA İÇİN MAİL İLE LİNK GÖNDERİLİR.
          if (!userData.emailVerified) {
               const token = await PocketToken.generateAndSaveToken({
                    project: "pocket-ui",
                    type: PocketToken.TokenType.LOGIN_VERIFY_EMAIL,
                    expiresIn: "3m",
                    payloadData: {
                         "username": userData.username,
                         "email": userData.email
                    }
               })
               await PocketMailManager.send({
                    subject: "Email Doğrulama İçin İşlem Onayı Gerekiyor",
                    to: userData.email,
                    mailType: PocketMailManager.MailType.REDIRECT_ACTION,
                    templateData: {
                         REDIRECT_URL: `${process.env.API_ENVIRONMENT_URL}/pocket-ui-verified-mail?token=${token}`,
                         USER_NAME: userData.username
                    }
               });

               throw new Error("Giriş işlemini yapabilmek için mail doğrulaması gereklidir.<br><b style='color:red'>" + userData.email + "</b> adresine gönderilen linke tıklayarak mail adresini doğrulayın.");
          }
          if (userData["2FacAuth"]) {
               const generateOtp = await PocketService.executeService("GenerateOTP","Notification");
               const otpCode = generateOtp.data.otp;
               const sendOtpMail = await PocketMailManager.send({
                    subject: "Oturum açmak için Email OTP Doğrulaması",
                    to: userData.email,
                    mailType: PocketMailManager.MailType.OTP_VERIFICATION,
                    templateData: {
                         "PROJECT_TYPE": "pocket-ui",
                         "OTP_CODE": otpCode,
                         "USER_NAME": userData.username,
                         "EXPIRE_SECONDS": 300 // (isteğe bağlı) OTP kodu 5 dakika geçerli olsun
                    }
               });

               if (sendOtpMail.sendStatus) {
                    return { "sendStatus": true };
               }
               else {
                    throw new Error("OTP Doğrulama kodu gönderilirken hata meydana geldi")
               }
          }

     } catch (error) {
          PocketLog.error(`ApiPocketLogin servisinde hata meydana geldi."` + error);
          throw new Error(error.message);
     }
});

export default ApiPocketLogin;