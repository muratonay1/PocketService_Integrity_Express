import { Modules, PocketLib } from "../constants.js";
import fetch from 'node-fetch';
import dotenv from 'dotenv';
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket,PocketUtility } = PocketLib;

/**
 * Pocket VerifyCaptcha servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const VerifyCaptcha = execute(async (criteria) => {
     try {
          dotenv.config();
          const secretKey = process.env.PMI_CAPTCHA_SECRET_KEY;
          let info = "Captcha Secret = " + secretKey;
          PocketLog.info(info);
          const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
          const captchaToken = criteria.captchaResponse;

          // Doğrulama için gereken parametreler
          const params = {
               secret: secretKey,
               response: captchaToken
          };

          // Doğrulama isteği yap
          const response = await fetch(`${verificationUrl}?${new URLSearchParams(params)}`, {
               method: "POST"
          });

          // Yanıtı JSON formatında al
          const responseData = await response.json();

          // Doğrulama başarılı mı kontrol et
          if (responseData.success) {

               let ipContextCriteria = Pocket.create();
               ipContextCriteria.put("ip",criteria.ip)

               const ipContext = await PocketService.executeService("FindIpContext",Modules.RESUME,ipContextCriteria);

               let updateDecisionData = Pocket.create();

               updateDecisionData.merge(PocketUtility.ConvertToPocket(ipContext.data));
               updateDecisionData.put("ip",criteria.ip);
               updateDecisionData.put("params.timestamp",PocketUtility.TimeStamp());
               updateDecisionData.put("params.lastLogin",PocketUtility.LoggerTimeStamp());
               if(ipContext.data.decisionCount == undefined) updateDecisionData.put("params.decisionCount",1);
               else updateDecisionData.put("params.decisionCount",ipContext.data.decisionCount + 1);
               updateDecisionData.put("params.entryCount",ipContext.data.entryCount + 1);
               updateDecisionData.remove("_id");

               const updateDecisionCount = await PocketService.executeService("UpdateDecisionResume", Modules.RESUME, updateDecisionData);

               if(updateDecisionCount){
                    return { success: true, message: 'Captcha verification successful.' };
               }

          }
          return { success: false, message: 'Captcha verification failed.' };

     } catch (error) {
          PocketLog.error(`VerifyCaptcha servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default VerifyCaptcha;