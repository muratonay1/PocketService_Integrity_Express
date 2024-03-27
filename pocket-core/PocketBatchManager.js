import PocketUtility from './PocketUtility.js';
import { schedule } from 'node-cron';
import { fork } from 'child_process';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import Pocket from './Pocket.js';
import PocketLog from './PocketLog.js';
import PocketConfigManager from './PocketConfigManager.js';
import { dbClient } from "./PocketMongo.js";
class PocketBatchManager {
     /**
      * Servis dosyasını yürütür ve belirli bir süre içinde sonuç alınmazsa zaman aşımı hatası fırlatır.
      * @param {Object} inBatch Servis adı
      */
     static async executeBatch(inBatch) {
          let infoStart = "[" + inBatch.module+"/"+inBatch.handler + "]" + " is running";
          PocketLog.info(infoStart);
          try {
               let serviceName = inBatch.handler
               let moduleName = inBatch.module
               checkModuleAndService(moduleName, serviceName);
               const serviceFilePath = `../Modules/${moduleName}/${PocketConfigManager.getServicePath()}${serviceName}.` + PocketConfigManager.getServiceType();

               const servicePromise = import(serviceFilePath).then(async serviceModule => {
                    if (!serviceModule) {
                         console.warn(`Service "${serviceName}" does not exist in module "${moduleName}".`);
                         return;
                    }

                    if (!serviceModule.default || typeof serviceModule.default !== 'function') {
                         console.warn(`Service "${serviceName}" does not have a valid default function in module "${moduleName}".`);
                         return;
                    }

                    await serviceModule.default();

                    let saveLog = {
                         "service":serviceName,
                         "module":moduleName,
                         "source":"batch",
                         "insertDate":PocketUtility.LoggerTimeStamp()
                    }
                    saveServiceLog(saveLog);

                    let infoEnd = "[" + inBatch.module+"/"+inBatch.handler + "]" + " is terminate successfully";
                    PocketLog.info(infoEnd);
               });

               const timeoutPromise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                         resolve(new Error(`Service "${serviceName}" timed out after ${PocketConfigManager.getServiceTimeout()}ms.`));
                    }, PocketConfigManager.getServiceTimeout());
               });

               const result = await Promise.race([servicePromise, timeoutPromise]);

               if (!(result instanceof Error)) {
                    return result;
               } else {
                    throw result;
               }
          } catch (error) {
               throw error;
          }
     }
     /**
      *
      * @param {Object} batch
      */
     static run(batch) {
          schedule(batch.cron, async () => {
               try {
                    await this.executeBatch(batch);
               } catch (error) {
                    console.error("Hata oluştu:", error);
               }
          });
     }
};

/**
 * Modül ve servis dosyasının mevcut olup olmadığını kontrol eder.
 * @param {String} moduleName Modül adı
 * @param {String} serviceName Servis adı
 */
function checkModuleAndService(moduleName, serviceName) {
     const __filename = fileURLToPath(import.meta.url);
     const __dirname = path.dirname(__filename);

     const modulePath = path.resolve(__dirname, `../Modules/${moduleName}`);
     const serviceFilePath = path.resolve(modulePath, `${PocketConfigManager.getServicePath()}/${serviceName}.` + PocketConfigManager.getServiceType());

     if (!fs.existsSync(modulePath) || !fs.lstatSync(modulePath).isDirectory()) {
          throw new Error(`Module "${moduleName}" does not exist.`);
     }

     if (!fs.existsSync(serviceFilePath) || !fs.lstatSync(serviceFilePath).isFile()) {
          throw new Error(`Service "${serviceName}" does not exist in module "${moduleName}".`);
     }
}

async function saveServiceLog(log) {
     let saveServiceLog = Pocket.create();
     saveServiceLog.put("service", log.service);
     saveServiceLog.put("module", log.module);
     saveServiceLog.put("source", log.source)
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
               throw error;
          }
     };
}

export default PocketBatchManager;
export { executeBatch };