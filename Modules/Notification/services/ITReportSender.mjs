import { MongoQueryFrom, PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

/**
 * Pocket ITReportSender servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const ITReportSender = execute(async (criteria) => {
     try {
          dotenv.config();

          const __filename = fileURLToPath(import.meta.url);
          const __dirname = dirname(__filename);

          const transporter = nodemailer.createTransport({
               service: 'gmail',
               auth: {
                    user: process.env.MAIL,
                    pass: process.env.MAIL_PASS
               }
          });

          let modifiedDir = __dirname.replace(/\\services$/, '').replace("Modules\\Notification", "Util\\MailTemplates\\");

          const htmlTemplatePath = modifiedDir + 'SuspiciousTransaction.html';
          const htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf8');

          const emailData = {
               xUserToken: criteria.from['x-user-token'],
               ip: criteria.ip,
               userAgent: criteria.from['user-agent'],
               accept: criteria.from.accept,
               postmanToken: criteria.from['postman-token'],
               host: criteria.from.host,
               acceptEncoding: criteria.from['accept-encoding'],
               connection: criteria.from.connection,
               path: criteria.path,
               limit: criteria.rateInfo.limit,
               used: criteria.rateInfo.used,
               remaining: criteria.rateInfo.remaining,
               resetTime: criteria.rateInfo.resetTime
          };

          const htmlContent = htmlTemplate.replace(/{{(\w+)}}/g, (match, key) => {
               return emailData[key] || match;
          });

          const mailOptions = {
               from: process.env.MAIL,
               to: process.env.IT_MAIL,
               subject: "Şüpheli İşlem Bildirimi (Repetitive Request Attack Threat)",
               html: htmlContent
          };

          const sendMailPromise = await new Promise((resolve, reject) => {
               // E-posta gönderme işlemi
               transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                         console.error('Email sending error:', error);
                         reject({ "sendStatus": false });
                         throw new Error("Email send Error");
                    } else {
                         console.log('Email sent:', info.response);
                         resolve({ "sendStatus": true });
                    }
               });
          })

          return sendMailPromise;

     } catch (error) {
          PocketLog.error(`ITReportSender servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default ITReportSender;