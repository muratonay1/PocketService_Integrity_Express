import { MongoQueryFrom, PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket SaveMail servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const SaveMail = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "name,subject,email,message,createDate,senderInfo");

          let insertMail = Pocket.create();

          insertMail.put("name",criteria.name);
          insertMail.put("subject",criteria.subject);
          insertMail.put("email",criteria.email);
          insertMail.put("message",criteria.message);
          insertMail.put("createDate",criteria.createDate);
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

          return insertResult;
     } catch (error) {
          PocketLog.error(`SaveMail servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default SaveMail;