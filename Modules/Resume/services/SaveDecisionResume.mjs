import PocketUtility from "../../../pocket-core/PocketUtility.js";
import { Modules, MongoQueryFrom, Operator, PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket SaveDecisionResume servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const SaveDecisionResume = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "ip,isFirst");
          let result = {};
          let isFirst = criteria.isFirst;
          let responseIp
          if(!isFirst){
               responseIp = await PocketService.executeService("FindIpContext", Modules.RESUME, criteria);

               if(responseIp.data.entryCount == 5){
                    return responseIp.data;
               }
               let filter = new PocketQueryFilter();
               filter.add("ip",criteria.ip).operator(Operator.EQ);

               let updatePocket = Pocket.create();

               updatePocket.merge(PocketUtility.ConvertToPocket(responseIp.data));
               updatePocket.put("entryCount",updatePocket.get("entryCount",Number) + 1);
               updatePocket.put("insertDate",PocketUtility.LoggerTimeStamp());
               updatePocket.put("timestamp",PocketUtility.TimeStamp());
               updatePocket.remove("_id");

               const updateResult = await new Promise((resolve, reject) => {
                    dbClient.executeUpdate({
                         from: MongoQueryFrom.DECISION,
                         where: filter,
                         params: updatePocket,
                         done: resolve,
                         fail: reject
                    });
               });

               result = updatePocket;

          }
          else{
               let uniqueId = await PocketService.executeService("GenerateUniqueID", Modules.UTILITY);

               let insertPocket = Pocket.create();

               insertPocket.put("ip",criteria.ip);
               insertPocket.put("insertDate",PocketUtility.LoggerTimeStamp());
               insertPocket.put("timestamp",PocketUtility.TimeStamp());
               insertPocket.put("entryCount",1);
               insertPocket.put("id",uniqueId.data["_id"]);

               const insertResult = await new Promise((resolve, reject) => {
                    dbClient.executeInsert({
                         from: MongoQueryFrom.DECISION,
                         params: insertPocket,
                         done: resolve,
                         fail: reject
                    });
               });
               result = insertPocket;
          }

          if (!PocketUtility.isEmptyObject(result)) {
               return result;
          }

          throw new Error("Save decision kaydetme işlemi başarısız oldu.");

     } catch (error) {
          PocketLog.error(`SaveDecisionResume servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default SaveDecisionResume;