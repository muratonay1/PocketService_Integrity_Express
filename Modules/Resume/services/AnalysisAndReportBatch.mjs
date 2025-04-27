import { PocketLib, Modules, MongoQueryFrom } from "../constants.js";
const { PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, executeBatch, dbClient, Pocket } = PocketLib;

/**
 * Pocket AnalysisAndReportBatch servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const AnalysisAndReportBatch = executeBatch(async (criteria) => {
     try {

          const responseCounter = await PocketService.executeService(`GetCounter`, Modules.RESUME);
          const responseBatchCounter = await PocketService.executeService(`GetBathCounter`, Modules.RESUME);

          if(responseCounter == responseBatchCounter){
          }

          return searchResult;
     } catch (error) {
          PocketLog.error(`AnalysisAndReportBatch servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});



export default AnalysisAndReportBatch;