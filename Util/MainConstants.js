import Pocket from "../pocket-core/Pocket.js";
import PocketConfigManager from "../pocket-core/PocketConfigManager.js";
import PocketLog from "../pocket-core/PocketLog.js";
import PocketUtility from "../pocket-core/PocketUtility.js";
import PocketService from "../pocket-core/PocketService.js";
// PocketLib importer
export const PocketLib = {
     Pocket,
     PocketConfigManager,
     PocketService,
     PocketUtility,
     PocketLog,
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
     "NOTIFICATION": "Notification"
}


/**
 * Genel anahtarlar nesnesi, belirli genel anahtarların adlarını içerir.
 * @typedef {Object} GeneralKeys
 * @property {string} STATUS - Durum anahtarı
 * @property {string} USER_ID - Kullanıcı kimliği anahtarı
 * @property {string} X_USER_TOKEN - User Permission Token kimliği anahtarı
 * @property {string} END_POINT
 * @property {string} HOST
 * @property {string} CREATED_REQUEST_TIME
 * @property {string} PARAMS
 * @property {string} ERROR
 */

/** @type {GeneralKeys} */
export const GeneralKeys = {
     "STATUS": "status",
     "USER_ID": "user_id",
     "X_USER_TOKEN":"x-user-token",
     "END_POINT":"endPoint",
     "HOST":"host",
     "CREATED_REQUEST_TIME":"createdRequestTime",
     "PARAMS":"params",
     "ERROR":"error"
}

/**
 * @typedef {Object} ERROR_MESSAGE
 * @property {string} UNAUTHERIZED_END_POINT
 * @property {string} EMPTY_TOKEN
 * @property {string} SERVER_RUN_ERROR
 * @property {string} API_TOKEN_NOT_FOUND
 * @property {string} API_RATE_LIMIT_ERROR
 */

/** @type {ERROR_MESSAGE} */
export const ERROR_MESSAGE = {
     "UNAUTHERIZED_END_POINT" : "'Authentication failed: Api endpoint is not autherized.'",
     "EMPTY_TOKEN":'Authentication failed: User token is not required',
     "SERVER_RUN_ERROR":"Server could not be started: An unexpected error occurred and the server could not be started. Please try again later or contact your system administrator.",
     "API_TOKEN_NOT_FOUND":"API token not found.",
     "API_RATE_LIMIT_ERROR":"Too many requests from this IP, please try again later"

}