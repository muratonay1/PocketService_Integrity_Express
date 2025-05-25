import Pocket from                                     "../core/Pocket.js";
import PocketConfigManager from                        "../core/PocketConfigManager.js";
import PocketList from                                 "../core/PocketList.js";
import PocketLog from                                  "../core/PocketLog.js";
import PocketMongo, { dbClient } from                  "../core/PocketMongo.js";
import PocketQueryFilter from                          "../core/PocketQueryFilter.js";
import PocketUtility from                              "../core/PocketUtility.js";
import PocketResponse from                             "../core/PocketResponse.js";
import PocketService, { execute } from                 "../core/PocketService.js";
import PocketBatchManager, { executeBatch } from       "../core/PocketBatchManager.js";

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
 */

/** @type {Modules} */
export const Modules = {
     "ANALYTICS": "Analytics",
     "NETFLIX": "Netflix",
     "ADMIN": "Admin",
     "NOTIFICATION": "Notification",
     "RESUME": "Resume"

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
 * @property {string} COMPLIANCE_REQUEST - Uyum bilgisi koleksiyonu
 */

/** @type {Collection} */
export const Collection = {
     "ERROR_LOGS": "ErrorLogs",
     "SESSION": "Session",
     "USERS": "Users",
     "API_LOG": "ApiLogs",
     "SERVER_INFO": "ServerInfo",
     "PERMISSION_TOKEN": "PermissionToken",
     "COMPLIANCE_REQUEST": "ComplianceRequest",
     "SERVICE": "service"
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
 * @property {string} COMPLIANCE_REQUEST - Uyum koleksiyonu
 * @property {string} SERVICE - service koleksiyonu
 */

/** @type {MongoQueryFrom} */
export const MongoQueryFrom = {
     "ERROR_LOGS": Db.ADMIN + "." + Collection.ERROR_LOGS,
     "SESSION": Db.ADMIN + "." + Collection.SESSION,
     "USERS": Db.ADMIN + "." + Collection.USERS,
     "API_LOG": Db.ADMIN + "." + Collection.API_LOG,
     "SERVER_INFO": Db.ADMIN + "." + Collection.SERVER_INFO,
     "PERMISSION_TOKEN": Db.ADMIN + "." + Collection.PERMISSION_TOKEN,
     "COMPLIANCE_REQUEST": Db.ADMIN + "." + Collection.COMPLIANCE_REQUEST,
     "SERVICE": Db.POCKET + "." + Collection.SERVICE,
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
     "X_USER_TOKEN": "x-user-token"
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
     "TOKEN_EXPIRED_ERROR_MESSAGE": "Token validity period has expired",
     "MAX_TOKEN_REQUESTS_ERROR_MESSAGE": "You have reached the maximum number of token requests allowed. Please try again later or contact support for assistance.",
     "ACTIVE_TOKEN_NOT_FOUND_ERROR_MESSAGE": "Token not found",
     "NO_SERVER_INFO_ERROR_MESSAGE": "No server info",
     "USER_NOT_FOUND_ERROR_MESSAGE": "Kullanıcı bulunamadı."
}


/**
 * @typedef {Object} GenerateOidType
 * @property {string} RESUME_REFERENCE_TOKEN - Resume modülünde kullanılan referanslar için üretilen unique tokenı iade eder.
 */

/** @type {GenerateOidType} */
export const GenerateOidType = {
     "RESUME_REFERENCE_TOKEN": "resumeGenerateToken",
}