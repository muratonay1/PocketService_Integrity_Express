import PocketConfigManager from "../../pocket-core/PocketConfigManager.js";
import PocketLog from "../../pocket-core/PocketLog.js";
import Pocket from "../../pocket-core/Pocket.js";
import PocketMongo, { dbClient } from "../../pocket-core/PocketMongo.js";
import PocketQueryFilter from "../../pocket-core/PocketQueryFilter.js";
import PocketUtility from "../../pocket-core/PocketUtility.js";
import PocketService, { execute } from "../../pocket-core/PocketService.js";

// PocketLib importer
export const PocketLib = {
	PocketConfigManager,
	PocketLog,
	PocketUtility,
	PocketMongo,
	PocketQueryFilter,
	PocketService,
	execute,
	dbClient,
	Pocket
};

/**
 * @typedef {Object} Db
 *
 * @property {string} MENUHTML
 */

/** @type {Db} */
export const Db = {
     "MENUHTML": "MenuHtml",
}

/**
 * @typedef {Object} Collection
 *
 * @property {string} accounts
 */

/** @type {Collection} */
export const Collection = {
     "ACCOUNTS": "accounts"
}

/**
 * @typedef {Object} MongoQueryFrom
 *
 * @property {string} ACCOUNTS
 */

/** @type {MongoQueryFrom} */
export const MongoQueryFrom = {
     "ACCOUNTS": Db.MENUHTML + "." + Collection.ACCOUNTS
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
 * @property {string} MENUHTML - RESUME modülü
 */

/** @type {Modules} */
export const Modules = {
     "MENUHTML": "MenuHtml"
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
