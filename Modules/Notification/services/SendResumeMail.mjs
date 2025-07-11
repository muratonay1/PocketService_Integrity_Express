import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
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

          // ES module için dirname çözümü
          const __filename = fileURLToPath(import.meta.url);
          const __dirname = path.dirname(__filename);

          const templatePath = path.resolve(__dirname, '../templates/resumeMail.html');
          let feedbackHTMLTemplate = await fs.readFile(templatePath, 'utf8');

          // Şablondaki değişkenleri değiştir
          feedbackHTMLTemplate = feedbackHTMLTemplate
               .replace(/{{name}}/g,         criteria.name)
               .replace(/{{email}}/g,        criteria.email)
               .replace(/{{subject}}/g,      criteria.subject)
               .replace(/{{message}}/g,      criteria.message)
               .replace(/{{ip}}/g,           criteria.senderInfo.ip)
               .replace(/{{hostname}}/g,     criteria.senderInfo.hostname)
               .replace(/{{country}}/g,      criteria.senderInfo.country)
               .replace(/{{countryCode}}/g,  criteria.senderInfo.countryCode)
               .replace(/{{city}}/g,         criteria.senderInfo.city)
               .replace(/{{region}}/g,       criteria.senderInfo.region)
               .replace(/{{timezone}}/g,     criteria.senderInfo.timezone)
               .replace(/{{year}}/g,         new Date().getFullYear());


          const transporter = nodemailer.createTransport({
               service: 'gmail',
               auth: {
                    user: process.env.MAIL,
                    pass: process.env.MAIL_PASS
               }
          });


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