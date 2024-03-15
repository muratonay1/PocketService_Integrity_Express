import PocketConfigManager from "../../pocket-core/PocketConfigManager.js";
import PocketLog from "../../pocket-core/PocketLog.js";
import Pocket from "../../pocket-core/Pocket.js";
import PocketMongo, { dbClient } from "../../pocket-core/PocketMongo.js";
import PocketQueryFilter from "../../pocket-core/PocketQueryFilter.js";
import PocketService, { execute } from "../../pocket-core/PocketService.js";

// PocketLib importer
export const PocketLib = {
     PocketConfigManager,
     PocketLog,
     PocketMongo,
     PocketQueryFilter,
     PocketService,
     execute,
     dbClient,
     Pocket
};

/**
 * Modüller nesnesi, belirli modüllerin anahtar-değer çiftlerini içerir.
 * @typedef {Object} Modules
 * @property {string} ANALYTICS - Analitik modülü
 * @property {string} NETFLIX - Netflix modülü
 * @property {string} ADMIN - Admin modülü
 * @property {string} NOTIFICATION - Bildirim modülü
 */

/** @type {Modules} */
export const Modules = {
     "ANALYTICS": "Analytics",
     "NETFLIX": "Netflix",
     "ADMIN": "Admin",
     "NOTIFICATION": "Notification"
}

/**
 * Veritabanı adları nesnesi, belirli veritabanı adlarını içerir.
 * @typedef {Object} Db
 * @property {string} ADMIN - Admin veritabanı adı
 */

/** @type {Db} */
export const Db = {
     "ADMIN": "admin",
}

/**
 * Koleksiyon adları nesnesi, belirli koleksiyon adlarını içerir.
 * @typedef {Object} Collection
 * @property {string} ERROR_LOGS - Hata günlükleri koleksiyonu
 * @property {string} SESSION - Oturum koleksiyonu
 * @property {string} USERS - Kullanıcılar koleksiyonu
 * @property {string} API_LOG - API günlükleri koleksiyonu
 * @property {string} SERVER_INFO - Sunucu bilgisi koleksiyonu
 */

/** @type {Collection} */
export const Collection = {
     "ERROR_LOGS": "ErrorLogs",
     "SESSION": "Session",
     "USERS": "Users",
     "API_LOG": "ApiLogs",
     "SERVER_INFO": "ServerInfo",
     "PERMISSION_TOKEN":"PermissionToken"
}

/**
 * MongoDB sorgu nesnesi, belirli koleksiyonlar için MongoDB sorgularını içerir.
 * @typedef {Object} MongoQueryFrom
 * @property {string} ERROR_LOGS - Hata günlükleri koleksiyonu sorgusu
 * @property {string} SESSION - Oturum koleksiyonu sorgusu
 * @property {string} USERS - Kullanıcılar koleksiyonu sorgusu
 * @property {string} API_LOG - API günlükleri koleksiyonu sorgusu
 * @property {string} SERVER_INFO - Sunucu bilgisi koleksiyonu sorgusu
 * @property {string} PERMISSION_TOKEN - Api Permission Token bilgisi koleksiyonu sorgusu
 */

/** @type {MongoQueryFrom} */
export const MongoQueryFrom = {
     "ERROR_LOGS": Db.ADMIN + "." + Collection.ERROR_LOGS,
     "SESSION": Db.ADMIN + "." + Collection.SESSION,
     "USERS": Db.ADMIN + "." + Collection.USERS,
     "API_LOG": Db.ADMIN + "." + Collection.API_LOG,
     "SERVER_INFO": Db.ADMIN + "." + Collection.SERVER_INFO,
     "PERMISSION_TOKEN": Db.ADMIN + "." + Collection.PERMISSION_TOKEN
}

/**
 * Genel anahtarlar nesnesi, belirli genel anahtarların adlarını içerir.
 * @typedef {Object} GeneralKeys
 * @property {string} STATUS - Durum anahtarı
 * @property {string} USER_ID - Kullanıcı kimliği anahtarı
 * @property {string} X_USER_TOKEN - User Permission Token kimliği anahtarı
 */

/** @type {GeneralKeys} */
export const GeneralKeys = {
     "STATUS": "status",
     "USER_ID": "user_id",
     "X_USER_TOKEN":"x-user-token"
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
