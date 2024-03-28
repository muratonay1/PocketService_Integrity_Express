import Pocket from './Pocket.js';
import PocketLog from './PocketLog.js';
import PocketUtility from './PocketUtility.js';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import PocketConfigManager from './PocketConfigManager.js';
import { dbClient } from "./PocketMongo.js";

class PocketService {
     /**
      * Servis dosyasını yürütür ve belirli bir süre içinde sonuç alınmazsa zaman aşımı hatası fırlatır.
      * @param {String} serviceName Servis adı
      * @param {String} moduleName Modül adı
      * @param {Pocket} parameter Giriş parametreleri
      */
     static async executeService(serviceName, moduleName, parameter) {
          const serviceFilePath = `../Modules/${moduleName}/${PocketConfigManager.getServicePath()}${serviceName}.` + PocketConfigManager.getServiceType();
          checkModuleAndService(moduleName, serviceName);
          PocketLog.info(`Triggered Service: ${serviceName}`);
          try {
               const servicePromise = import(serviceFilePath).then(async serviceModule => {
                    if (!serviceModule) {
                         console.warn(`Service "${serviceName}" does not exist in module "${moduleName}".`);
                         return;
                    }

                    if (!serviceModule.default || typeof serviceModule.default !== 'function') {
                         console.warn(`Service "${serviceName}" does not have a valid default function in module "${moduleName}".`);
                         return;
                    }

                    let serviceResponse;
                    if (parameter !== undefined) {
                         serviceResponse = await serviceModule.default(parameter);
                    } else {
                         serviceResponse = await serviceModule.default();
                    }
                    let saveLog = {
                         "response": serviceResponse,
                         "service": serviceName,
                         "module": moduleName,
                         "source": "service",
                         "insertDate": PocketUtility.LoggerTimeStamp()
                    }
                    if (parameter != undefined) saveLog["params"] = parameter;
                    saveServiceLog(saveLog);
                    let servicePocket = new Pocket();
                    servicePocket.put("data", serviceResponse);
                    servicePocket.put("timestamp", PocketUtility.TimeStamp());
                    return servicePocket;
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
      * Asenkron bir servis çağrısını yürütür ve sonucu bir Promise olarak döndürür.
      * @param {String} serviceName Servis adı
      * @param {String} module Modül adı
      * @param {Array} parameters Giriş parametreleri
      * @param {number} timeout Zaman aşımı süresi (milisaniye cinsinden)
      * @returns {Promise} Servis çağrısının sonucu
      */
     static executeAsyncService(serviceName, module, parameters) {
          return new Promise((resolve, reject) => {
               const servicePromise = this.executeService(serviceName, module, parameters, response => {
                    resolve(response.data);
               }, PocketConfigManager.getServiceTimeout())
                    .catch(reject);

               const timeoutPromise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                         reject(new Error(`Service "${serviceName}" timed out after ${PocketConfigManager.getServiceTimeout()}ms.`));
                    }, PocketConfigManager.getServiceTimeout());
               });
               Promise.race([servicePromise, timeoutPromise]);
          });
     }

     /**
      * Kriterlerin belirli alanlarını zorunlu olarak doldurup doldurmadığını kontrol eder.
      * @param {Object} criteria Kriterler
      * @param {String} mandatoryFields Zorunlu alanlar
      * @returns {boolean} Zorunlu alanların dolup dolmadığı
      */
     static parameterMustBeFill(criteria, mandatoryFields) {
          const mandatoryFieldList = mandatoryFields.split(',').map(field => field.trim());
          const missingFields = mandatoryFieldList.filter(field => {
               if (field.includes('.')) {
                    const nestedFields = field.split('.'); // Eğer alan içinde nokta varsa (obje içindeki bir alan), bu alanı parçalara ayır
                    let nestedObject = criteria;
                    for (const nestedField of nestedFields) {
                         if (!nestedObject.hasOwnProperty(nestedField)) {
                              return true; // Eğer bir iç içe alan eksikse, true döndür ve filtrede tut
                         }
                         nestedObject = nestedObject[nestedField]; // Eğer iç içe alan mevcutsa, iç içe objeyi güncelle
                    }
                    return false; // Tüm iç içe alanlar mevcutsa, false döndür ve filtrede tutma
               } else {
                    return !Object.keys(criteria).includes(field); // Eğer alan direkt obje içindeyse, anahtarları kontrol et
               }
          });

          if (missingFields.length > 0) {
               throw new Error(`"${missingFields.join(', ')}" parameter(s) must be filled.`);
          }
          return true;
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
     try
     {
          let saveServiceLog = Pocket.create();
          if (log.params != undefined) saveServiceLog.put("params", log.params);
          saveServiceLog.put("response", log.response);
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
     catch (error)
     {
          PocketLog.error("PocketService Class: saveServiceLog metodu hata aldı.");
          throw new Error(error);
     }
}

/**
 * Fonksiyonu yürüten bir yürütücü döndürür.
 * @param {function} fn Yürütülecek fonksiyon
 * @returns {function} Yürütücü
 */
function execute(fn) {
     return async function (...args) {
          try {
               const result = await fn(...args);
               return result;
          } catch (error) {
               throw error;
          }
     };
}

export default PocketService;
export { execute };