import { ERROR_MESSAGE, Modules } from "./Util/MainConstants.js";
import Pocket from "./pocket-core/Pocket.js";
import PocketBatchManager from "./pocket-core/PocketBatchManager.js";
import PocketLog from "./pocket-core/PocketLog.js";
import PocketService from "./pocket-core/PocketService.js";
import PocketHealthHandler from './pocket-core/PocketHealthHandler.js'


let batchCriteria = Pocket.create();
batchCriteria.put("status", "1")
const serviceResponse = await PocketService.executeService(`GetBatchJobs`, Modules.POCKET, batchCriteria);

if (serviceResponse.data.length == 0) {
     throw new Error(ERROR_MESSAGE.BATCH_RECORD_NOT_FOUND)
}

let batchs = serviceResponse.data;

async function processBatches(batches) {
     const batchPromises = batches.map(batch => {
          let info = batch.module + "/" + batch.handler + " included in the job queue";
          PocketLog.info(info);
          return PocketBatchManager.run(batch);
     });

     try {
          await Promise.all(batchPromises); // Tüm batch işlemlerini paralel çalıştır
     } catch (error) {
          PocketLog.error("Error occurred during batch processing:", error);
     }
}


processBatches(batchs)
     .then(async () => {
          await PocketHealthHandler.startMonitoring('batch');
          PocketLog.info("ALL BATCHS PROCESSINGS SUCCESSFULL");
     })
     .catch(error => {
          console.error("Hata oluştu:", error);
     });
