import PocketLog from "../../../pocket-core/PocketLog.js";
import PocketMongo from "../../../pocket-core/PocketMongo.js";
import PocketQueryFilter from "../../../pocket-core/PocketQueryFilter.js";
import PocketService, { execute } from "../../../pocket-core/PocketService.js";
import { MongoQueryFrom } from "../constants.js";
import nodemailer from 'nodemailer';

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const SendOTP = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "otpData");

          let subject = 'Pocket OTP Oturum Kontrol';
          let type = 'otp';
          if(criteria.otpData.type != undefined){
               if(criteria.otpData.type == "email"){
                    subject = 'Pocket Email Activation';
                    type = "email";
               }
          }



          // E-posta gönderimi için SMTP ulaşımı sağlayan taşıyıcı ayarları
          const transporter = nodemailer.createTransport({
               service: 'gmail',
               auth: {
                    user: process.env.MAIL,
                    pass: process.env.MAIL_PASS
               }
          });

          const currentDate = new Date(); // Geçerli tarih ve saat
          const expirationDate = new Date(currentDate.getTime() + criteria.otpData.expiredSecond * 1000); // Geçerli zamanı ve süreyi ekleyerek son kullanma tarihini hesapla
          const expirationTimeString = expirationDate.toLocaleString(); // Son kullanma tarihini kullanıcı dostu bir formata dönüştür

          const htmlTemplateEMAIL = `
               <div style="padding: 20px; border: 1px solid #ccc; background-color: #f9f9f9;">
                    <p style="font-size: 16px;">Merhaba,</p>
                    <p style="font-size: 14px;">Bu bir E-Mail doğrulama e-postasıdır. Lütfen aşağıdaki doğrulama linkine tıklayarak hesabınızı aktif hale getirin:</p>
                    <p id="otp" style="font-size: 24px; font-weight: bold; color: #007bff;">${`http://127.0.0.1:49255/index.html/?token=${criteria.otpData.token}`}</p>
                    <p style="font-size: 14px;">Bu linkin geçerlilik süresi: ${expirationTimeString}</p>
               </div>
               <p style="font-size: 16px; font-weight: bold;">İMO CORP.</p>
               `;

          const htmlTemplateOTP = `
          <div style="padding: 20px; border: 1px solid #ccc; background-color: #f9f9f9;">
               <p style="font-size: 16px;">Merhaba,</p>
               <p style="font-size: 14px;">BBu bir OTP doğrulama e-postasıdır. Lütfen aşağıdaki doğrulama kodunu kullanarak işlemi tamamlayın:</p>
               <p id="otp" style="font-size: 24px; font-weight: bold; color: #007bff;">${criteria.otpData.otp}</p>
               <p style="font-size: 14px;">Bu kodu hiç kimseyle paylaşmayınız.</p>
               <p style="font-size: 14px;">Bu linkin geçerlilik süresi: ${expirationTimeString}</p>
          </div>
          <p style="font-size: 16px; font-weight: bold;">İMO CORP.</p>
          `

          // E-posta seçenekleri
          const mailOptions = {
               from: process.env.MAIL,
               to: criteria.otpData.mailTo,
               subject: subject,
               html: type == "email" ? htmlTemplateEMAIL : htmlTemplateOTP
          };

          const sendMailPromise = await new Promise((resolve, reject) => {
               // E-posta gönderme işlemi
               transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                         console.error('Email sending error:', error);
                         reject();
                         throw new Error("Mail send Error");
                    } else {
                         console.log('Email sent:', info.response);
                         resolve({ "sendStatus": true });
                    }
               });
          })

          return sendMailPromise;
     } catch (error) {
          PocketLog.error("SendOTP servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});

export default SendOTP;