import Pocket from "../../pocket-core/Pocket.js";
import PocketConfigManager from "../../pocket-core/PocketConfigManager.js";
import PocketList from "../../pocket-core/PocketList.js";
import PocketLog from "../../pocket-core/PocketLog.js";
import PocketMongo, { dbClient } from "../../pocket-core/PocketMongo.js";
import PocketQueryFilter from "../../pocket-core/PocketQueryFilter.js";
import PocketUtility from "../../pocket-core/PocketUtility.js";
import PocketResponse from "../../pocket-core/PocketResponse.js";
import PocketService, { execute } from "../../pocket-core/PocketService.js";
import PocketBatchManager, { executeBatch } from "../../pocket-core/PocketBatchManager.js";

// PocketLib importer
export const PocketLib = {
     Pocket,
     PocketList,
     PocketConfigManager,
     PocketResponse,
     PocketMongo,
     PocketQueryFilter,
     PocketBatchManager,
     PocketService,
     execute,
     executeBatch,
     PocketUtility,
     PocketLog,
     dbClient,
}

/**
 * Modüller nesnesi, belirli modüllerin anahtar-değer çiftlerini içerir.
 * @typedef {Object} Modules
 * @property {string} ANALYTICS - Analitik modülü
 * @property {string} NETFLIX - Netflix modülü
 * @property {string} ADMIN - Admin modülü
 * @property {string} NOTIFICATION - Bildirim modülü
 * @property {string} POCKET - POCKET modülü
 */

/** @type {Modules} */
export const Modules = {
     "ANALYTICS": "Analytics",
     "NETFLIX": "Netflix",
     "ADMIN": "Admin",
     "NOTIFICATION": "Notification",
     "POCKET":"Pocket"

}

/**
 * Veritabanı adları nesnesi, belirli veritabanı adlarını içerir.
 * @typedef {Object} Db
 * @property {string} POCKET - Admin veritabanı adı
 */

/** @type {Db} */
export const Db = {
     "POCKET": "pocket",
}

/**
 * Koleksiyon adları nesnesi, belirli koleksiyon adlarını içerir.
 * @typedef {Object} Collection
 * @property {string} BATCH_DEFINATION - Hata günlükleri koleksiyonu
 * @property {string} SERVICE - Hata günlükleri koleksiyonu
 */

/** @type {Collection} */
export const Collection = {
     "BATCH_DEFINATION": "batchDefination",
     "SERVICE":"service"
}

/**
 * MongoDB sorgu nesnesi, belirli koleksiyonlar için MongoDB sorgularını içerir.
 * @typedef {Object} MongoQueryFrom
 * @property {string} BATCH_DEFINATION - Hata günlükleri koleksiyonu sorgusu
 * @property {string} SERVICE - Hata günlükleri koleksiyonu sorgusu
 */

/** @type {MongoQueryFrom} */
export const MongoQueryFrom = {
     "BATCH_DEFINATION": Db.POCKET + "." + Collection.BATCH_DEFINATION,
     "SERVICE": Db.POCKET + "." + Collection.SERVICE,
}

/**
 * Genel anahtarlar nesnesi, belirli genel anahtarların adlarını içerir.
 * @typedef {Object} GeneralKeys
 * @property {string} STATUS - Durum anahtarı
 * @property {string} MODULE - modül  anahtarı
 * @property {string} HANDLER - handler anahtarı
 */

/** @type {GeneralKeys} */
export const GeneralKeys = {
     "STATUS": "status",
     "MODULE":"module",
     "HANDLER":"handler"
}

/**
 * Durumlar nesnesi, belirli durumların anahtar-değer çiftlerini içerir.
 * @typedef {Object} Status
 * @property {string} ACTIVE - Aktif durum
 * @property {string} PASSIVE - Pasif durum
 */

/** @type {Status} */
export const Status = {
     "ACTIVE": "1",
     "PASSIVE": "0"
}


/**
 * Operatörler nesnesi, belirli operatörlerin karşılık gelen sembollerini içerir.
 * @typedef {Object} Operator
 * @property {string} EQ - Eşitlik operatörü, "==" sembolü ile temsil edilir.
 * @property {string} GT - Büyüktür operatörü, ">" sembolü ile temsil edilir.
 * @property {string} LT - Küçüktür operatörü, "<" sembolü ile temsil edilir.
 * @property {string} GTE - Büyük eşittir operatörü, ">=" sembolü ile temsil edilir.
 * @property {string} LTE - Küçük eşittir operatörü, "<=" sembolü ile temsil edilir.
 * @property {string} NE - Eşit değil operatörü, "!=" sembolü ile temsil edilir.
 * @property {string} IN - İçerir operatörü, "IN" sembolü ile temsil edilir.
 */

/** @type {Operator} */
export const Operator = {
     "EQ": "==",
     "GT": ">",
     "LT": "<",
     "GTE": ">=",
     "LTE": "<=",
     "NE": "!=",
     "IN": "IN"
}

/**
 * @typedef {Object} ERROR_MESSAGE
 * @property {string} TOKEN_EXPIRED_ERROR_MESSAGE - Token süresi geçmiş token için döndürülür.
 * @property {string} MAX_TOKEN_REQUESTS_ERROR_MESSAGE - Maximum istek sayısı dolmuş token uyarısı
 * @property {string} ACTIVE_TOKEN_NOT_FOUND_ERROR_MESSAGE - İstek yapan client için aktif token bulunmadığını bildirir.
 * @property {string} NO_SERVER_INFO_ERROR_MESSAGE - Aktif bir serverin bulunmadığını bildirir.
 * @property {string} USER_NOT_FOUND_ERROR_MESSAGE - Kullanıcının bulunamadığını bildirir.
 */

/** @type {ERROR_MESSAGE} */
export const ERROR_MESSAGE = {
     "TOKEN_EXPIRED_ERROR_MESSAGE" : "Token validity period has expired",
     "MAX_TOKEN_REQUESTS_ERROR_MESSAGE" : "You have reached the maximum number of token requests allowed. Please try again later or contact support for assistance.",
     "ACTIVE_TOKEN_NOT_FOUND_ERROR_MESSAGE" : "User's active token was not found",
     "NO_SERVER_INFO_ERROR_MESSAGE" : "No server info",
     "USER_NOT_FOUND_ERROR_MESSAGE" : "Kullanıcı bulunamadı."


}