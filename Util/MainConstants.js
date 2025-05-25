import Pocket from "../pocket-core/core/Pocket.js";
import PocketConfigManager from "../pocket-core/core/PocketConfigManager.js";
import PocketLog from "../pocket-core/core/PocketLog.js";
import PocketUtility from "../pocket-core/core/PocketUtility.js";
import PocketService from "../pocket-core/core/PocketService.js";
import PocketMailManager from "../pocket-core/core/PocketMailManager.js";
import {dbClient} from '../pocket-core/core/PocketMongo.js';
// PocketLib importer
export const PocketLib = {
     Pocket,
     PocketConfigManager,
     PocketService,
     PocketUtility,
     PocketLog,
     dbClient,
     PocketMailManager
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
 * @property {string} BATCH_RECORD_NOT_FOUND
 */

/** @type {ERROR_MESSAGE} */
export const ERROR_MESSAGE = {
     "UNAUTHERIZED_END_POINT" : "'Authentication failed: Api endpoint is not autherized.'",
     "EMPTY_TOKEN":'Authentication failed: User token is not required',
     "SERVER_RUN_ERROR":"Server could not be started: An unexpected error occurred and the server could not be started. Please try again later or contact your system administrator.",
     "API_TOKEN_NOT_FOUND":"API token not found.",
     "API_RATE_LIMIT_ERROR":"Too many requests from this IP, please try again later",
     "BATCH_RECORD_NOT_FOUND" : "Batch record not found.",

}