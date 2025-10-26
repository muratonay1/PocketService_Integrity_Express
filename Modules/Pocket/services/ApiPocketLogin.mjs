import { PocketLib } from "../constants.js";
const {  PocketLog, PocketMongo, PocketService, execute,  Pocket, PocketUtility, PocketMailManager,PocketOtpManager, PocketToken, dotenv } = PocketLib;
dotenv.config();
/**
 * Pocket ApiPocketLogin servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const ApiPocketLogin = execute(async (criteria) => {
     try {
          const validationRules = {
               "username": { alias: "username", required: true, notEmpty: true },
               "password": { alias: "password", required: true, notEmpty: true}
          };

          let { username, password } = PocketService.serviceParameterValidate(criteria, validationRules);

          let searchUserQuery = Pocket.create();
          searchUserQuery.put("username", username);
          searchUserQuery.put("password", password);

          const responseUserService = await PocketService.executeService(`UserSearch`, `Pocket`, searchUserQuery);

          let userData = responseUserService.data;

          if (password != PocketUtility.decrypt(userData.password)) {
               throw new Error("Kullanıcı adı veya şifre hatalı. Lütfen geçerli bir kullanıcı adı veya şifre girin.");
          }

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
               const responseGenerateOtp = await PocketOtpManager.generate({
                    "referenceKey": "pocket-ui",
                    "primaryKey": userData.email
               })
               const sendOtpMail = await PocketMailManager.send({
                    subject: "Oturum açmak için Email OTP Doğrulaması",
                    to: userData.email,
                    mailType: PocketMailManager.MailType.OTP_VERIFICATION,
                    templateData: {
                         "PROJECT_TYPE": "pocket-ui",
                         "OTP_CODE": responseGenerateOtp,
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
          /**
           * Burada session oluşturmak gerekiyor.
           * Eğer aktif bir session varsa -> Aktif oturum bilgisi verilip oturum açma işlemi engellenir.
           * Eğer aktif bir session yoksa -> create() ile yeni bir oturum oluşturulmalı.
           */

          //Kodu buradan yazmaya başlayabilirsin...


     } catch (error) {
          PocketLog.error(`ApiPocketLogin servisinde hata meydana geldi."` + error);
          throw new Error(error.message);
     }
});

export default ApiPocketLogin;