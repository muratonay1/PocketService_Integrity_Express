import PocketConfigManager from "../../pocket-core/core/PocketConfigManager.js";
import PocketList from "../../pocket-core/core/PocketList.js";
import Pocket from "../../pocket-core/core/Pocket.js";
import PocketLog from "../../pocket-core/core/PocketLog.js";
import PocketMongo, { dbClient } from "../../pocket-core/core/PocketMongo.js";
import PocketQueryFilter from "../../pocket-core/core/PocketQueryFilter.js";
import PocketUtility from "../../pocket-core/core/PocketUtility.js";
import PocketResponse from "../../pocket-core/core/PocketResponse.js";
import PocketService, { execute } from "../../pocket-core/core/PocketService.js";

// PocketLib importer
export const PocketLib = {
     Pocket,
     PocketList,
     PocketConfigManager,
     PocketResponse,
     PocketMongo,
     PocketQueryFilter,
     PocketService,
     execute,
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
 * @property {string} UTILITY - Utility modülü
 */

/** @type {Modules} */
export const Modules = {
     "ANALYTICS": "Analytics",
     "NETFLIX": "Netflix",
     "ADMIN": "Admin",
     "NOTIFICATION": "Notification",
     "UTILITY":"Utility"
}

/**
 * Veritabanı adları nesnesi, belirli veritabanı adlarını içerir.
 * @typedef {Object} Db
 * @property {string} ADMIN - Admin veritabanı adı
 * @property {string} NOTIFICATION - Bildirim veritabanı adı
 */

/** @type {Db} */
export const Db = {
     "ADMIN": "admin",
     "NOTIFICATION": "notification",
}

/**
 * Koleksiyon adları nesnesi, belirli koleksiyon adlarını içerir.
 * @typedef {Object} Collection
 * @property {string} ERROR_LOGS - Hata günlükleri koleksiyonu
 * @property {string} SESSION - Oturum koleksiyonu
 * @property {string} USERS - Kullanıcılar koleksiyonu
 * @property {string} OTP - OTP koleksiyonu
 * @property {string} TOKEN - Token koleksiyonu
 */

/** @type {Collection} */
export const Collection = {
     "ERROR_LOGS": "ErrorLogs",
     "SESSION": "Session",
     "USERS": "Users",
     "OTP": "otp",
     "TOKEN": "token"
}

/**
 * MongoDB sorgu nesnesi, belirli koleksiyonlar için MongoDB sorgularını içerir.
 * @typedef {Object} MongoQueryFrom
 * @property {string} ERROR_LOGS - Hata günlükleri koleksiyonu sorgusu
 * @property {string} SESSION - Oturum koleksiyonu sorgusu
 * @property {string} USERS - Kullanıcılar koleksiyonu sorgusu
 * @property {string} OTP - OTP koleksiyonu sorgusu
 * @property {string} TOKEN - Token koleksiyonu sorgusu
 */

/** @type {MongoQueryFrom} */
export const MongoQueryFrom = {
     "ERROR_LOGS": Db.ADMIN + "." + Collection.ERROR_LOGS,
     "SESSION": Db.ADMIN + "." + Collection.SESSION,
     "USERS": Db.ADMIN + "." + Collection.USERS,
     "OTP": Db.NOTIFICATION + "." + Collection.OTP,
     "TOKEN": Db.NOTIFICATION + "." + Collection.TOKEN
}

/**
 * Genel anahtarlar nesnesi, belirli genel anahtarların adlarını içerir.
 * @typedef {Object} GeneralKeys
 * @property {string} STATUS - Durum anahtarı
 * @property {string} USER_ID - Kullanıcı kimliği anahtarı
 * @property {string} OTP - Otp anahtarı
 */

/** @type {GeneralKeys} */
export const GeneralKeys = {
     "STATUS": "status",
     "USER_ID": "userId",
     "OTP":"otp"
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
 * Error code list
 * @typedef {Object} Errors
 * @property {string} TOKEN_EXPIRED - OTP'nin süresinin geçtiğini belirtir.
 */

/** @type {Errors} */
export const Errors = {
     "TOKEN_EXPIRED": "OTP Code expired date."
}


/**
 * Error code list
 * @typedef {Object} ITMailType
 * @property {string} SUSPECT_DETECT - Şüpheli işlem bildirim maili
 * @property {string} TOKEN_LIMIT_EXCEEDED - Token limit dolumu maili
 */

/** @type {ITMailType} */
export const ITMailType = {
     "SUSPECT_DETECT": "0",
     "TOKEN_LIMIT_EXCEEDED": "1"
}



