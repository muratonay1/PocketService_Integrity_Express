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
          // moduleName "pocket-core" ise özel path
          const basePath = moduleName === "pocket-core"
               ? `../services/`
               : `../../Modules/${moduleName}/${PocketConfigManager.getServicePath()}`;

          const serviceFilePath = basePath + serviceName + "." + PocketConfigManager.getServiceType();

          checkModuleAndService(moduleName, serviceName);

          try {
               const servicePromise = import(serviceFilePath).then(async serviceModule => {
                    if (!serviceModule || typeof serviceModule.default !== 'function') {
                         console.warn(`Service "${serviceName}" is not properly defined in module "${moduleName}".`);
                         return;
                    }

                    PocketLog.info(`Trigger : ${serviceName}`);
                    const serviceResponse = parameter !== undefined
                         ? await serviceModule.default(parameter)
                         : await serviceModule.default();

                    const servicePocket = new Pocket();
                    servicePocket.put("data", serviceResponse);
                    servicePocket.put("timestamp", PocketUtility.TimeStamp());
                    return servicePocket;


               });

               const timeoutPromise = new Promise(resolve => {
                    setTimeout(() => {
                         resolve(new Error(`Service "${serviceName}" timed out after ${PocketConfigManager.getServiceTimeout()}ms.`));
                    }, PocketConfigManager.getServiceTimeout());
               });

               const result = await Promise.race([servicePromise, timeoutPromise]);

               if (result instanceof Error) throw result;
               return result;

          } catch (error) {
               throw error;
          }
     }


     /**
     * Blok içinde servis çağrılarını paralel olarak çalıştırır.
     * @param {Function} blockFunction Blok fonksiyonu
     * @returns {Object} responseMap (Her servis adı için response döner)
     */
     static async executeAsyncBlock(blockFunction) {
          const tasks = [];
          const responseMap = {};

          try {
               const blockContext = {
                    async execute(serviceName, moduleName, parameters, returnResponse = false) {
                         const timeout = PocketConfigManager.getServiceTimeout(); // Timeout süresi sınıftan çekiliyor
                         const task = PocketService.executeAsyncService(serviceName, moduleName, parameters, timeout)
                              .then((response) => {
                                   if (returnResponse) {
                                        responseMap[serviceName] = response;
                                   }
                              });
                         tasks.push(task);
                    },
               };

               // Blok içindeki servis çağrılarını çalıştır
               await blockFunction(blockContext);

               // Tüm servisleri paralel olarak çalıştır
               await Promise.all(tasks);

               // Eğer response dönen servisler varsa, bunları responseMap ile döndür
               return responseMap;
          } catch (error) {
               throw new Error(`executeAsyncBlock sırasında hata oluştu: ${error.message}`);
          }
     }

     /**
      * Tek bir servis çağrısını çalıştırır ve zaman aşımı kontrolü yapar.
      * @param {String} serviceName Servis adı
      * @param {String} moduleName Modül adı
      * @param {Object} parameters Parametreler
      * @param {Number} timeout Zaman aşımı süresi (milisaniye cinsinden)
      * @returns {Promise<any>} Servis sonucu
      */
     static executeAsyncService(serviceName, moduleName, parameters, timeout) {
          return new Promise((resolve, reject) => {
               // Servis çağrısı
               const servicePromise = this.executeService(serviceName, moduleName, parameters)
                    .then(resolve)
                    .catch(reject);

               // Timeout kontrolü
               const timeoutPromise = new Promise((_, rejectTimeout) => {
                    setTimeout(() => {
                         rejectTimeout(new Error(`Service "${serviceName}" timed out after ${timeout}ms.`));
                    }, timeout);
               });

               // Yarışan vaatlerden biri tamamlanır
               Promise.race([servicePromise, timeoutPromise]).then(resolve).catch(reject);
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

     let modulePath;
     let serviceFilePath;

     if (moduleName === "pocket-core") {
          modulePath = path.resolve(__dirname, `../services`);
          serviceFilePath = path.resolve(modulePath, `${serviceName}.${PocketConfigManager.getServiceType()}`);
     } else {
          modulePath = path.resolve(__dirname, `../../Modules/${moduleName}`);
          serviceFilePath = path.resolve(modulePath, `${PocketConfigManager.getServicePath()}/${serviceName}.${PocketConfigManager.getServiceType()}`);
     }

     if (!fs.existsSync(modulePath) || !fs.lstatSync(modulePath).isDirectory()) {
          throw new Error(`Module "${moduleName}" does not exist.`);
     }

     if (!fs.existsSync(serviceFilePath) || !fs.lstatSync(serviceFilePath).isFile()) {
          throw new Error(`Service "${serviceName}" does not exist in module "${moduleName}".`);
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