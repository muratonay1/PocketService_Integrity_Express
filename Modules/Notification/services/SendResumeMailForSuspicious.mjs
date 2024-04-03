import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
/**
 * Pocket SendResumeMailForSuspicious servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const SendResumeMailForSuspicious = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "ip");

          dotenv.config();

          let subject = '(WEB TRAFFIC -'+criteria.ip+') - muratonay.com.tr';
          let type = 'suspicious';

          const transporter = nodemailer.createTransport({
               service: 'gmail',
               auth: {
                    user: process.env.MAIL,
                    pass: process.env.MAIL_PASS
               }
          });

          const trafficHTMLTemplate = `
               <!DOCTYPE html>
               <html lang="en">
               <head>
               <meta charset="UTF-8">
               <meta name="viewport" content="width=device-width, initial-scale=1.0">
               <title>Feedback</title>
               <style>
                    body {
                         font-family: Arial, sans-serif;
                         background-color: #f9f9f9;
                    }
                    .container {
                         max-width: 600px;
                         margin: 0 auto;
                         padding: 20px;
                         background-color: #fff;
                         border: 1px solid #ccc;
                         border-radius: 5px;
                         box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    }
                    .header {
                         text-align: center;
                         margin-bottom: 20px;
                    }
                    .message {
                         font-size: 16px;
                         margin-bottom: 20px;
                    }
               </style>
               </head>
               <body>
               <div class="container">
                    <div class="header">
                         <h2>Karar Mekanizmasına bir istek düştü. ${criteria.ip} adresi şüpheli olarak algılandı.</h2>
                    </div>
                    <div class="message">
                         <p><strong>İp Adresi:</strong>${criteria.name}</p>
                         <p><strong>İlk Giriş Aktivite:</strong>${criteria.insertDate}</p>
                         <p><strong>Son Giriş Aktivite:</strong> ${criteria.lastLogin}</p>
                         <p><strong>Karar Mekanizmasına Düşüş Sayısı:</strong> ${criteria.decisionCount}</p>
                         <p><strong>Toplam Giriş Sayısı</strong> ${criteria.entryCount}</p>
                    </div>
               </div>
               </body>
               </html>
               `
               ;

          const mailOptions = {
               from: process.env.MAIL,
               to: process.env.MAIL,
               subject: subject,
               html: trafficHTMLTemplate
          };

          const sendMailPromise = await new Promise((resolve, reject) => {
               // E-posta gönderme işlemi
               transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                         console.error('Email sending error:', error);
                         reject({ "sendStatus": false });
                         throw new Error("Mail send Error");
                    } else {
                         console.log('Email sent:', info.response);
                         resolve({ "sendStatus": true });
                    }
               });
          })

          if (!sendMailPromise.sendStatus) PocketLog.info("SendResumeMailForSuspicious -> Mail gönderim işlemi başarısız.");


          return sendMailPromise;
     } catch (error) {
          PocketLog.error(`SendResumeMailForSuspicious servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default SendResumeMailForSuspicious;