import PocketUtility from "../../../pocket-core/PocketUtility.js";
import { MongoQueryFrom, PocketLib, Modules } from "../constants.js";
import ResumeUtil from "../util/ResumeUtil.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket SaveMail servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const SaveMail = execute(async (criteria) => {
     try {

          let criteriaContext = Pocket.create();
          criteriaContext.put("ip", criteria.ip);
          const contextControl = await PocketService.executeService("FindIpContext", Modules.RESUME, criteriaContext);
          if (contextControl.data.entryCount % 10 == 0) {
               return false;
          }

          PocketService.parameterMustBeFill(criteria, "name,subject,email,message,createDate,senderInfo");
          validateCriteria(criteria);

          let mailCounterCriteria = Pocket.create();
          mailCounterCriteria.put("ip",criteria.ip);
          mailCounterCriteria.put("insertDate",PocketUtility.GetRealDate());
          const mailCounter = await PocketService.executeService("SearchMail", Modules.RESUME, mailCounterCriteria);
          if(mailCounter.data.length >= 5)
          {
               return "Günlük maximum mail gönderimine ulaşıldı.";
          }
          let insertMail = Pocket.create();
          insertMail.put("name", criteria.name);
          insertMail.put("subject", criteria.subject);
          insertMail.put("email", criteria.email);
          insertMail.put("message", criteria.message);
          insertMail.put("timestamp",PocketUtility.TimeStamp());
          insertMail.put("insertDate",PocketUtility.GetRealDate());
          insertMail.put("insertTime",PocketUtility.GetRealTime());
          insertMail.put("loggerTimeStamp",PocketUtility.LoggerTimeStamp());
          insertMail.put("ip", criteria.ip);
          insertMail.put("senderInfo", JSON.parse(criteria.senderInfo));
          const insertResult = await new Promise((resolve, reject) => {
               dbClient.executeInsert({
                    from: MongoQueryFrom.MAIL,
                    params: insertMail,
                    done: resolve,
                    fail: reject
               });
          });
          if (insertResult) {
               PocketLog.info("Resume mail kaydetme işlemi başarılı. Mail gönderim işlemi başladı.");
               const sendMail = await PocketService.executeService("SendResumeMail", Modules.NOTIFICATION, insertMail);
               if (sendMail.data.sendStatus) {
                    PocketLog.info("Resume mail gönderme işlemi başarılı.");
                    return true;
               }
          }
          return false;
     } catch (error) {
          PocketLog.error(`SaveMail servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

/**
 *
 * @private
 */
function validateCriteria(criteria) {
     ResumeUtil.validateName(criteria.name);
     ResumeUtil.validateSubject(criteria.subject);
     ResumeUtil.validateEmail(criteria.email);
     ResumeUtil.validateMessage(criteria.message);
     ResumeUtil.validateIp(criteria.ip);
     ResumeUtil.validateSenderInfo(criteria.senderInfo);
}

export default SaveMail;