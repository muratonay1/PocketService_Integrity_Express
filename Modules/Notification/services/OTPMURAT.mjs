import PocketLog from "../../../pocket-core/core/PocketLog.js";
import PocketMongo from "../../../pocket-core/core/PocketMongo.js";
import PocketQueryFilter from "../../../pocket-core/core/PocketQueryFilter.js";
import PocketService, { execute } from "../../../pocket-core/core/PocketService.js";
import { MongoQueryFrom } from "../constants.js";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const SendOTP = execute(async (criteria) => {
     try {

          // E-posta gönderimi için SMTP ulaşımı sağlayan taşıyıcı ayarları
          const transporter = nodemailer.createTransport({
               service: 'gmail',
               auth: {
                    user: process.env.POCKET_MAIL,
                    pass: process.env.POCKET_MAIL_PASS
               }
          });
          let otpCode = 125932;

          const htmlTemplateEMAIL = `
               <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; font-family: Arial, sans-serif;">
               <div style="text-align: center; margin-bottom: 20px;">
               <h2 style="color: #007bff; margin: 0;">E-Mail Doğrulama</h2>
               </div>
               <p style="font-size: 16px; color: #333333;">Merhaba,</p>
               <p style="font-size: 14px; color: #555555;">
               Aşağıdaki OTP kodunu kullanarak hesabınızı doğrulayabilirsiniz.
               OTP kodunuz <strong>5 dakika</strong> boyunca geçerlidir.
               </p>
               <div style="margin: 20px 0; text-align: center;">
               <span style="font-size: 32px; font-weight: bold; color: #007bff;">${otpCode}</span>
               </div>
               <p style="font-size: 14px; color: #555555;">
               Eğer siz bu işlemi yapmadıysanız, bu e-postayı güvenle göz ardı edebilirsiniz.
               </p>
               <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
               <p style="font-size: 12px; color: #999999; text-align: center;">
               Bu e-posta POCKET CORP taraf\u0131ndan gönderilmiştir.
               </p>
               </div>
          `;


          // E-posta seçenekleri
          const mailOptions = {
               from: process.env.MAIL,
               to: "imuratony@gmail.com",
               subject: "Otp 2FA Doğrulama Kodu",
               html: htmlTemplateEMAIL
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