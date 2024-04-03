import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
/**
 * Pocket SendResumeMail servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const SendResumeMail = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "ip,email");

          dotenv.config();

          let subject = 'Contact from muratonay.com.tr - ' + criteria.email;
          let type = 'contact';

          const transporter = nodemailer.createTransport({
               service: 'gmail',
               auth: {
                    user: process.env.MAIL,
                    pass: process.env.MAIL_PASS
               }
          });

          const feedbackHTMLTemplate = `
               <!DOCTYPE html>
               <html lang="en">
               <head>
               <meta charset="UTF-8">
               <meta name="viewport" content="width=device-width, initial-scale=1.0">
               <title>Feedback</title>
               <style>
                    /* CSS stilla burada */
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
                    .info {
                         font-size: 14px;
                         color: #666;
                    }
               </style>
               </head>
               <body>
               <div class="container">
                    <div class="header">
                         <h2>Feedback</h2>
                    </div>
                    <div class="message">
                         <p><strong>Name:</strong>${criteria.name}</p>
                         <p><strong>Subject:</strong>${criteria.subject}</p>
                         <p><strong>Email:</strong> ${criteria.email}</p>
                         <p><strong>Message:</strong> ${criteria.message}</p>
                    </div>
                    <div class="info">
                         <p><strong>Sender Information:</strong></p>
                         <p><strong>IP Address:</strong> ${criteria.senderInfo.ipAddress}</p>
                         <p><strong>Country:</strong> ${criteria.senderInfo.countryName} ({{senderInfo.countryCode}})</p>
                         <p><strong>City:</strong> ${criteria.senderInfo.cityName}</p>
                         <p><strong>Region:</strong> ${criteria.senderInfo.regionName}</p>
                         <p><strong>Time Zone:</strong> ${criteria.senderInfo.timeZone}</p>
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
               html: feedbackHTMLTemplate
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

          if(!sendMailPromise.sendStatus) PocketLog.info("SendResumeMail -> Mail gönderim işlemi başarısız.");


          return sendMailPromise;
     } catch (error) {
          PocketLog.error(`SendResumeMail servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default SendResumeMail;