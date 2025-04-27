import PocketConfigManager from "../../pocket-core/PocketConfigManager.js";
import PocketLog from "../../pocket-core/PocketLog.js";
import Pocket from "../../pocket-core/Pocket.js";
import PocketMongo, { dbClient } from "../../pocket-core/PocketMongo.js";
import PocketQueryFilter from "../../pocket-core/PocketQueryFilter.js";
import PocketUtility from "../../pocket-core/PocketUtility.js";
import PocketService, { execute } from "../../pocket-core/PocketService.js";
import PocketBatchManager, { executeBatch } from "../../pocket-core/PocketBatchManager.js";

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
	Pocket
};



/**
 * @typedef {Object} Db
 *
 * @property {string} SCRAPPER
 */

/** @type {Db} */
export const Db = {
     "SCRAPPER": "Scrapper",
}

/**
 * @typedef {Object} Collection
 *
 * @property {string} CURRENCY
 */

/** @type {Collection} */
export const Collection = {
     "CURRENCY": "currency",
}

/**
 * @typedef {Object} MongoQueryFrom
 *
 * @property {string} CURRENCY
 */

/** @type {MongoQueryFrom} */
export const MongoQueryFrom = {
     "CURRENCY": Db.SCRAPPER + "." + Collection.CURRENCY
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
 * @property {string} SCRAPPER - RESUME modülü
 * @property {string} UTILITY - RESUME modülü
 * @property {string} NOTIFICATION - RESUME modülü
 */

/** @type {Modules} */
export const Modules = {
     "SCRAPPER": "Scrapper",
	"UTILITY": "Utility",
	"NOTIFICATION":"Notification"
}

