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

          const cacheBustedPath = `${serviceFilePath}?update=${Date.now()}`; // cache kırıcı

          checkModuleAndService(moduleName, serviceName);

          try {
               const servicePromise = import(cacheBustedPath).then(async serviceModule => {
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
               PocketLog.error("Hata alan servis: " + serviceFilePath);
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

     /**
     * @summary Gelen servis parametrelerini, tanımlanmış bir kurallar bütününe göre merkezi olarak doğrular ve yeni bir nesne olarak döndürür.
     * @description Bu metod, kendisine verilen `criteria` nesnesini **DEĞİŞTİRMEZ (immutable)**.
     * Bunun yerine, doğrulama başarılı olursa, `alias` ve `default` kuralları uygulanmış,
     * sadece kurallarda belirtilen alanları içeren **YENİ bir nesne** döndürür. Bu, yan etkileri önler ve güvenli bir veri akışı sağlar.
     *
     * @param {object} criteria - Doğrulanacak parametreleri içeren ve servise gelen orijinal nesne.
     * @param {object} rules - Doğrulama kurallarını tanımlayan nesne. Nesnenin her bir anahtarı, `criteria` içindeki bir alan adına karşılık gelir.
     * @param {object} rules.fieldName - Belirli bir alan için doğrulama kurallarını içeren nesne. Her 'fieldName' `criteria` içindeki bir anahtara karşılık gelmelidir.
     * @param {boolean} [rules.fieldName.required=false] - Alanın `criteria` nesnesinde bulunmasının zorunlu olup olmadığını belirtir. `true` ise ve alan yoksa hata fırlatılır.
     * @param {boolean} [rules.fieldName.notEmpty=false] - `true` ise, alanın değerinin `null` veya boş string (`''`) olamayacağını belirtir.
     * @param {string} [rules.fieldName.type] - Alanın beklenen veri tipini belirtir. Değerler `PocketService.parameterType` enum'undan gelmelidir (örn: 'string', 'number', 'email').
     * @param {*} [rules.fieldName.default] - Alan `criteria` nesnesinde bulunmazsa (`undefined`), döndürülecek yeni nesneye atanacak varsayılan değeri belirtir.
     * @param {function(value:*, fieldName:string, criteria:object): (true|string)} [rules.fieldName.validator] - Özel doğrulama mantığı için bir fonksiyon. Fonksiyon `true` dönerse doğrulama başarılıdır. Bir `string` dönerse, bu string hata mesajı olarak kullanılır.
     * @param {string} [rules.fieldName.alias] - Değerin, döndürülecek yeni nesnedeki anahtar adını belirtir. Belirtilmezse orijinal alan adı kullanılır.
     * @param {object} [rules.fieldName.nested] - Eğer alan bir nesne ise, bu nesnenin içindeki alanları doğrulamak için kullanılan bir başka `rules` nesnesidir.
     *
     * @throws {Error} Doğrulama başarısız olursa, tüm doğrulama hatalarını birleştirilmiş bir metinle içeren bir `Error` nesnesi fırlatır.
     * @returns {object} Doğrulanmış, işlenmiş ve temizlenmiş verileri içeren YENİ bir nesne.
     *
     * @example
     * const rules = {
     * email: { required: true, type: this.parameterType.EMAIL, alias: 'userEmail' },
     * name: { required: true },
     * rememberMe: { type: this.parameterType.BOOLEAN, default: false }
     * };
     * // 'validatedParams' artık { userEmail: '...', name: '...', rememberMe: false } gibi bir nesnedir.
     * const validatedParams = PocketService.serviceParameterValidate(criteria, rules);
     * console.log(validatedParams.userEmail);
     */
     static serviceParameterValidate(criteria, rules) {
          const validatedData = {};
          const errors = [];
          const ruleKeys = Object.keys(rules);

          for (const fieldName of ruleKeys) {
               const rule = rules[fieldName];
               let value = criteria[fieldName];

               if (value === undefined && rule.default !== undefined) {
                    value = rule.default;
               }

               if (rule.required && value === undefined) {
                    errors.push(`"${fieldName}" parametresi zorunludur.`);
                    continue;
               }
               if (!rule.required && value === undefined) {
                    continue;
               }

               if (rule.notEmpty && (value === null || value === '')) {
                    errors.push(`"${fieldName}" parametresi boş olamaz.`);
                    continue;
               }

               if (value === null || value === undefined) {
                    const finalKey = rule.alias || fieldName;
                    validatedData[finalKey] = value;
                    continue;
               }

               if (rule.type) {
                    let typeError = '';
                    switch (rule.type) {
                         case this.parameterType.STRING: if (!PocketUtility.isString(value)) typeError = 'string olmalıdır.'; break;
                         case this.parameterType.NUMBER: if (!PocketUtility.isNumber(value)) typeError = 'sayı olmalıdır.'; break;
                         case this.parameterType.BOOLEAN: if (!PocketUtility.isBoolean(value)) typeError = 'boolean (true/false) olmalıdır.'; break;
                         case this.parameterType.OBJECT: if (!PocketUtility.isObject(value)) typeError = 'nesne (object) olmalıdır.'; break;
                         case this.parameterType.ARRAY: if (!PocketUtility.isArray(value)) typeError = 'dizi (array) olmalıdır.'; break;
                         case this.parameterType.EMAIL: const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; if (!PocketUtility.isString(value) || !emailRegex.test(value)) typeError = 'geçerli bir e-posta adresi olmalıdır.'; break;
                         default: PocketLog.warn(`Bilinmeyen doğrulama tipi: ${rule.type}`);
                    }
                    if (typeError) { errors.push(`"${fieldName}" parametresi ${typeError}`); }
               }

               if (rule.validator && typeof rule.validator === 'function') {
                    const result = rule.validator(value, fieldName, criteria);
                    if (result !== true) { const errorMessage = typeof result === 'string' ? result : `"${fieldName}" alanı özel doğrulamayı geçemedi.`; errors.push(errorMessage); }
               }

               if (rule.nested && PocketUtility.isObject(value)) {
                    try {
                         const nestedValidatedData = this.serviceParameterValidate(value, rule.nested);
                         const finalKey = rule.alias || fieldName;
                         validatedData[finalKey] = nestedValidatedData;
                         continue;
                    } catch (nestedError) {
                         errors.push(`"${fieldName}" alanı içindeki hatalar: ${nestedError.message}`);
                    }
               }

               const finalKey = rule.alias || fieldName;
               validatedData[finalKey] = value;
          }

          // DEĞİŞİKLİK: Bilinmeyen parametre uyarısı tamamen kaldırıldı.
          // Metod artık sadece 'rules' içinde tanımlanan alanlarla ilgilenir.

          if (errors.length > 0) {
               throw new Error(errors.join(' | '));
          }

          return validatedData;
     }

     /**
     * @summary `serviceParameterValidate` metodunda kullanılacak standart parametre tipleri için bir sabitler nesnesi (enum).
     * @description Bu nesne, tip kontrollerinde string literalleri yerine sabitler kullanarak yazım hatalarını önlemeye ve kod okunabilirliğini artırmaya yardımcı olur.
     * @readonly
     * @enum {string}
     */
     static parameterType = {
          "STRING": "string",
          "BOOLEAN": "boolean",
          "NUMBER": "number",
          "OBJECT": "object",
          "ARRAY": "array",
          "EMAIL": "email"
     };
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