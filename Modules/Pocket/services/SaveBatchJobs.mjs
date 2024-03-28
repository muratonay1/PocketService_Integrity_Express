import { GeneralKeys, MongoQueryFrom, PocketLib, Status } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket SaveBatchJobs servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const SaveBatchJobs = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "module,handler,cron,name");

          let insertPocket = Pocket.create();

          insertPocket.put(GeneralKeys.MODULE,criteria.module);
          insertPocket.put(GeneralKeys.HANDLER,criteria.handler);
          insertPocket.put(GeneralKeys.CRON,criteria.cron);
          insertPocket.put("name",criteria.name);
          insertPocket.put(GeneralKeys.STATUS,Status.ACTIVE);

          const insertResult = await new Promise((resolve, reject) => {
               dbClient.executeInsert({
                    from: MongoQueryFrom.BATCH_DEFINATION,
                    params: insertPocket,
                    done: resolve,
                    fail: reject
               });
          });
          if(insertResult){
               return insertResult;
          }
          throw new Error("SaveBatchJobs Service: Batch kaydı esnasında hata alındı. insertResult: " + insertResult);
     } catch (error) {
          PocketLog.error(`SaveBatchJobs servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default SaveBatchJobs;