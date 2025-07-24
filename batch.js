// batch.js
import { ERROR_MESSAGE, Modules } from "./Util/MainConstants.js";
import Pocket from "./pocket-core/core/Pocket.js";
import PocketBatchManager from "./pocket-core/core/PocketBatchManager.js";
import PocketLog from "./pocket-core/core/PocketLog.js";
import PocketService from "./pocket-core/core/PocketService.js";
import PocketHealthHandler from './pocket-core/core/PocketHealthHandler.js';

const seenBatch = new Map();
let batchCriteria = Pocket.create();
batchCriteria.put("status", "1");
const serviceResponse = await PocketService.executeService(`GetBatchJobs`, Modules.POCKET, batchCriteria);

if (serviceResponse.data.length == 0) {
     throw new Error(ERROR_MESSAGE.BATCH_RECORD_NOT_FOUND);
}

let batchs = serviceResponse.data;

async function processBatches(batches) {
     seenBatch.clear();
     const batchPromises = batches.map(batch => {
          const key = `${batch.module}/${batch.handler}`;
          seenBatch.set(key, {
               cron: batch.cron,
               name: batch.name,
               status: batch.status
          });
          PocketLog.info(`${key} included in the job queue`);
          return PocketBatchManager.run(batch);
     });

     try {
          await Promise.all(batchPromises);
     } catch (error) {
          PocketLog.error("Error occurred during batch processing:", error);
     }
}

async function checkForNewBatches() {
     let batchCriteria = Pocket.create();
     batchCriteria.put("status", "1");
     const serviceResponse = await PocketService.executeService(`GetBatchJobs`, Modules.POCKET, batchCriteria);

     const currentKeysFromDB = new Set(serviceResponse.data.map(batch => `${batch.module}/${batch.handler}`));

     // Yeni batch'leri bul
     const newBatches = serviceResponse.data.filter(batch => {
          const key = `${batch.module}/${batch.handler}`;
          return !seenBatch.has(key);
     });

     // Silinmiş batch'leri bul
     const removedKeys = [...seenBatch.keys()].filter(key => !currentKeysFromDB.has(key));

     // Güncellenmiş batch'leri bul
     const updatedBatches = serviceResponse.data.filter(batch => {
          const key = `${batch.module}/${batch.handler}`;
          if (!seenBatch.has(key)) return false;

          const old = seenBatch.get(key);
          const updatedFields = [];

          if (old.cron !== batch.cron) updatedFields.push("cron");
          if (old.name !== batch.name) updatedFields.push("name");
          if (old.status !== batch.status) updatedFields.push("status");

          if (updatedFields.length > 0) {
               PocketLog.warn(`[UPDATED] ${key} updated fields: ${updatedFields.join(", ")}`);
               return true;
          }
          return false;
     });

     // Silinenleri kaldır
     removedKeys.forEach(key => {
          seenBatch.delete(key);
          const index = batchs.findIndex(b => `${b.module}/${b.handler}` === key);
          if (index !== -1) {
               batchs.splice(index, 1);
               PocketLog.warn(`[REMOVED] ${key} removed from scheduler.`);
          }
          PocketBatchManager.remove?.(key);
     });

     // Yeni batch'leri ekle
     newBatches.forEach(batch => {
          const key = `${batch.module}/${batch.handler}`;
          PocketLog.warn(`[NEW] ${key} added to scheduler.`);
          seenBatch.set(key, {
               cron: batch.cron,
               name: batch.name,
               status: batch.status
          });
          batchs.push(batch);
          PocketBatchManager.run(batch);
     });

     // Güncellenen batch'leri yeniden çalıştır
     updatedBatches.forEach(batch => {
          const key = `${batch.module}/${batch.handler}`;
          PocketBatchManager.remove?.(key);
          PocketBatchManager.run(batch);
          seenBatch.set(key, {
               cron: batch.cron,
               name: batch.name,
               status: batch.status
          });
     });
}

await processBatches(batchs)
     .then(async () => {
          await PocketHealthHandler.startMonitoring('batch');
          PocketLog.info("Batchs loaded success.");
     })
     .catch(error => {
          console.error("Hata oluştu:", error);
     });

setInterval(checkForNewBatches, 60 * 1000);
