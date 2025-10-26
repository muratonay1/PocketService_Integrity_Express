import PocketConfigManager from "../../pocket-core/core/PocketConfigManager.js";
import PocketLog from "../../pocket-core/core/PocketLog.js";
import Pocket from "../../pocket-core/core/Pocket.js";
import PocketMongo, { dbClient } from "../../pocket-core/core/PocketMongo.js";
import PocketQueryFilter from "../../pocket-core/core/PocketQueryFilter.js";
import PocketUtility from "../../pocket-core/core/PocketUtility.js";
import PocketService, { execute } from "../../pocket-core/core/PocketService.js";
import PocketBatchManager, { executeBatch } from "../../pocket-core/core/PocketBatchManager.js";
import PocketRemoteRequest from "../../pocket-core/core/PocketRemoteRequest.js";
// PocketLib importer
export const PocketLib = {
	PocketConfigManager,
	PocketBatchManager,
	PocketLog,
	PocketUtility,
	PocketMongo,
	PocketQueryFilter,
	PocketService,
	execute,
	executeBatch,
	dbClient,
	Pocket,
	PocketRemoteRequest
};
/**
 * @typedef {Object} Db
 *
 * @property {string} EXTERNAL_INQUIRY
 */
/** @type {Db} */
export const Db = {
     "EXTERNAL_INQUIRY": "ExternalInquiry",
}
/**
 * @typedef {Object} Collection
 *
 * @property {string} CURRENCY
 */
/** @type {Collection} */
export const Collection = {
     "CURRENCY": "currency",
	"FOREIGN_EXCHANGE":"foreignExchange"
}
/**
 * @typedef {Object} MongoQueryFrom
 *
 * @property {string} CURRENCY
 */
/** @type {MongoQueryFrom} */
export const MongoQueryFrom = {
     "CURRENCY": Db.EXTERNAL_INQUIRY + "." + Collection.CURRENCY,
	"FOREIGN_EXCHANGE": Db.EXTERNAL_INQUIRY + "." + Collection.FOREIGN_EXCHANGE
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
 * @typedef {Object} Modules
 *
 * @property {string} EXTERNAL_INQUIRY - ExternalInquiry modülü
 * @property {string} UTILITY - Utility modülü
 * @property {string} NOTIFICATION - Notification modülü
 */

/** @type {Modules} */
export const Modules = {
	"UTILITY": "Utility",
	"NOTIFICATION":"Notification",
	"EXTERNAL_INQUIRY":"ExternalInquiry"
}