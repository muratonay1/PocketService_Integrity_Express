// PocketBatchManager.js
import PocketUtility from './PocketUtility.js';
import { schedule } from 'node-cron';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import Pocket from './Pocket.js';
import PocketLog from './PocketLog.js';
import PocketConfigManager from './PocketConfigManager.js';
import { dbClient } from "./PocketMongo.js";

class PocketBatchManager {
     static jobs = new Map(); // {module/handler: cronJob}

     static async executeBatch(inBatch) {
          let infoStart = `[${inBatch.module}/${inBatch.handler}] is running`;
          PocketLog.info(infoStart);
          try {
               let serviceName = inBatch.handler;
               let moduleName = inBatch.module;
               checkModuleAndService(moduleName, serviceName);
               const serviceFilePath = `../../Modules/${moduleName}/${PocketConfigManager.getServicePath()}${serviceName}.` + PocketConfigManager.getServiceType();

               const servicePromise = import(serviceFilePath).then(async serviceModule => {
                    if (!serviceModule || !serviceModule.default || typeof serviceModule.default !== 'function') {
                         console.warn(`Service "${serviceName}" is invalid in module "${moduleName}".`);
                         return;
                    }

                    await serviceModule.default();

                    let saveLog = {
                         "service": serviceName,
                         "module": moduleName,
                         "source": "batch",
                         "insertDate": PocketUtility.LoggerTimeStamp()
                    };
                    saveServiceLog(saveLog);

                    PocketLog.info(`[${moduleName}/${serviceName}] is terminate successfully`);
               });

               const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => {
                         reject(new Error(`Service "${serviceName}" timed out after ${PocketConfigManager.getServiceTimeout()}ms.`));
                    }, PocketConfigManager.getServiceTimeout());
               });

               await Promise.race([servicePromise, timeoutPromise]);
          } catch (error) {
               PocketLog.error(`Batch execution failed: ${error.message}`);
          }
     }

     static run(batch) {
          const key = `${batch.module}/${batch.handler}`;
          if (this.jobs.has(key)) {
               PocketLog.warn(`[SKIP] ${key} is already scheduled.`);
               return;
          }
          const job = schedule(batch.cron, async () => {
               try {
                    await this.executeBatch(batch);
               } catch (error) {
                    console.error("Hata oluştu:", error);
               }
          });
          this.jobs.set(key, job);
          PocketLog.info(`[RUN] ${key} scheduled with cron: ${batch.cron}`);
     }

     static remove(key) {
          const job = this.jobs.get(key);
          if (job) {
               job.stop();
               this.jobs.delete(key);
               PocketLog.warn(`[STOP] ${key} unscheduled and removed.`);
          }
     }
}

function checkModuleAndService(moduleName, serviceName) {
     const __filename = fileURLToPath(import.meta.url);
     const __dirname = path.dirname(__filename);
     const modulePath = path.resolve(__dirname, `../../Modules/${moduleName}`);
     const serviceFilePath = path.resolve(modulePath, `${PocketConfigManager.getServicePath()}/${serviceName}.` + PocketConfigManager.getServiceType());

     if (!fs.existsSync(modulePath) || !fs.lstatSync(modulePath).isDirectory()) {
          throw new Error(`Module "${moduleName}" does not exist.`);
     }
     if (!fs.existsSync(serviceFilePath) || !fs.lstatSync(serviceFilePath).isFile()) {
          throw new Error(`Service "${serviceName}" does not exist in module "${moduleName}".`);
     }
}

async function saveServiceLog(log) {
     try {
          let saveServiceLog = Pocket.create();
          saveServiceLog.put("service", log.service);
          saveServiceLog.put("module", log.module);
          saveServiceLog.put("source", log.source);
          saveServiceLog.put("insertDate", log.insertDate);

          const insertResult = await new Promise((resolve, reject) => {
               dbClient.executeInsert({
                    from: "pocket.service",
                    params: saveServiceLog,
                    done: resolve,
                    fail: reject
               });
          });
          return insertResult;
     } catch (error) {
          PocketLog.error("PocketBatchManager Class: saveServiceLog metodu hata aldı.");
          throw new Error(error);
     }
}

/**
 * Fonksiyonu yürüten bir yürütücü döndürür.
 * @param {function} fn Yürütülecek fonksiyon
 * @returns {function} Yürütücü
 */
function executeBatch(fn) {
     return async function (...args) {
          try {
               const result = await fn(...args);
               return result;
          } catch (error) {
               throw new Error(error);
          }
     };
}

export default PocketBatchManager;
export { executeBatch };