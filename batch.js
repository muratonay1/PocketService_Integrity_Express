import { ERROR_MESSAGE, Modules } from "./Util/MainConstants.js";
import Pocket from "./pocket-core/Pocket.js";
import PocketBatchManager from "./pocket-core/PocketBatchManager.js";
import PocketLog from "./pocket-core/PocketLog.js";
import PocketService from "./pocket-core/PocketService.js";


const serviceResponse = await PocketService.executeService(`GetBatchJobs`, Modules.POCKET);

if (serviceResponse.data.length == 0) {
     throw new Error(ERROR_MESSAGE.BATCH_RECORD_NOT_FOUND)
}

let batchs = serviceResponse.data;

async function processBatches(batches) {
     for (const batch of batches) {
          let info = batch.module+"/"+batch.handler + " included in the job queue";
          PocketLog.info(info)
          await PocketBatchManager.run(batch);
     }
}

processBatches(batchs)
     .then(() => {
          PocketLog.info("ALL BATCHS PROCESSINGS SUCCESSFULL");
     })
     .catch(error => {
          console.error("Hata oluştu:", error);
     });
