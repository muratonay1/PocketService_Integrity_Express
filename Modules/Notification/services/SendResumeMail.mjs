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
               <meta charset="UTF-8" />
               <meta name="viewport" content="width=device-width, initial-scale=1.0" />
               <title>Feedback</title>
               </head>
               <body style="margin:0; padding:0; font-family:'Segoe UI', sans-serif; background-color:#f2f4f8;">

               <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0; background-color:#f2f4f8;">
               <tr>
                    <td align="center">
                    <table cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

                         <!-- Header -->
                         <tr>
                         <td style="background: linear-gradient(90deg, #4e54c8, #8f94fb); padding: 24px; text-align:center; color: white;">
                         <h1 style="margin:0; font-size:24px;">Feedback Received</h1>
                         </td>
                         </tr>

                         <!-- Message Details -->
                         <tr>
                         <td style="padding: 24px;">
                         <h2 style="font-size:18px; margin-bottom:16px; color:#333;">Message Details</h2>

                         <table style="width:100%; margin-bottom:20px;">
                              <tr>
                              <td style="font-weight:bold; width:150px;">Name:</td>
                              <td style="text-align:right;">${criteria.name}</td>
                              </tr>
                              <tr>
                              <td style="font-weight:bold;">Subject:</td>
                              <td style="text-align:right;">${criteria.subject}</td>
                              </tr>
                              <tr>
                              <td style="font-weight:bold;">Email:</td>
                              <td style="text-align:right;"><a href="mailto:${criteria.email}">${criteria.email}</a></td>
                              </tr>
                              <tr>
                              <td style="font-weight:bold;">Message:</td>
                              <td style="text-align:right;">${criteria.message}</td>
                              </tr>
                         </table>

                         <hr style="border:none; border-top:1px solid #e0e0e0; margin:24px 0;" />

                         <!-- Sender Info -->
                         <h2 style="font-size:18px; margin-bottom:16px; color:#333;">Sender Information</h2>
                         <table style="width:100%;">
                              <tr>
                              <td style="font-weight:bold; width:150px;">IP Address:</td>
                              <td style="text-align:right;">${criteria.senderInfo.ip}</td>
                              </tr>
                              <tr>
                              <td style="font-weight:bold;">Hostname:</td>
                              <td style="text-align:right;"><a href="http://${criteria.senderInfo.hostname}">${criteria.senderInfo.hostname}</a></td>
                              </tr>
                              <tr>
                              <td style="font-weight:bold;">Country:</td>
                              <td style="text-align:right;">${criteria.senderInfo.country} (${criteria.senderInfo.region})</td>
                              </tr>
                              <tr>
                              <td style="font-weight:bold;">City:</td>
                              <td style="text-align:right;">${criteria.senderInfo.city}</td>
                              </tr>
                              <tr>
                              <td style="font-weight:bold;">Region:</td>
                              <td style="text-align:right;">${criteria.senderInfo.region}</td>
                              </tr>
                              <tr>
                              <td style="font-weight:bold;">Time Zone:</td>
                              <td style="text-align:right;">${criteria.senderInfo.timezone}</td>
                              </tr>
                         </table>
                         </td>
                         </tr>

                         <!-- Footer -->
                         <tr>
                         <td style="background-color:#f8f9fa; text-align:center; padding:16px; font-size:12px; color:#888;">
                         &copy; ${new Date().getFullYear()} muratonay.com.tr — All rights reserved.
                         </td>
                         </tr>

                    </table>
                    </td>
               </tr>
               </table>

               </body>
               </html>
               `;



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

          if (!sendMailPromise.sendStatus) PocketLog.info("SendResumeMail -> Mail gönderim işlemi başarısız.");


          return sendMailPromise;
     } catch (error) {
          PocketLog.error(`SendResumeMail servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default SendResumeMail;