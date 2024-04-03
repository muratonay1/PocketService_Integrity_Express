import { MongoQueryFrom, PocketLib ,Modules} from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket SaveMail servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const SaveMail = execute(async (criteria) => {
     try {
          let criteriaContext = Pocket.create();
          criteriaContext.put("ip",criteria.ip);
          const contextControl = await PocketService.executeService("FindIpContext", Modules.RESUME, criteriaContext);

          if(contextControl.data.entryCount % 10 == 0){
               return false;
          }
          PocketService.parameterMustBeFill(criteria, "name,subject,email,message,createDate,senderInfo");

          let insertMail = Pocket.create();

          insertMail.put("name",criteria.name);
          insertMail.put("subject",criteria.subject);
          insertMail.put("email",criteria.email);
          insertMail.put("message",criteria.message);
          insertMail.put("createDate",criteria.createDate);
          insertMail.put("ip",criteria.ip);
          insertMail.put("senderInfo",JSON.parse(criteria.senderInfo));

          // insertResult success:true, fail:false
          const insertResult = await new Promise((resolve, reject) => {
               dbClient.executeInsert({
                    from: MongoQueryFrom.MAIL,
                    params: insertMail,
                    done: resolve,
                    fail: reject
               });
          });

          if(insertResult) {

               PocketLog.info("Resume mail kaydetme işlemi başarılı. Mail gönderim işlemi başladı.");

               const sendMail = await PocketService.executeService("SendResumeMail", Modules.NOTIFICATION, insertMail);

               if(sendMail.data.sendStatus){

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

export default SaveMail;