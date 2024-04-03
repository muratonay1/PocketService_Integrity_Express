import PocketConfigManager from "../../pocket-core/PocketConfigManager.js";
import PocketLog from "../../pocket-core/PocketLog.js";
import Pocket from "../../pocket-core/Pocket.js";
import PocketUtility from "../../pocket-core/PocketUtility.js";
import PocketRemoteRequest from "../../pocket-core/PocketRemoteRequest.js";
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
	PocketUtility,
	PocketRemoteRequest,
	execute,
	dbClient,
	Pocket
};

/**
 * @typedef {Object} Db
 *
 * @property {string} RESUME
 */

/** @type {Db} */
export const Db = {
     "RESUME": "resume",
}

/**
 * @typedef {Object} Collection
 *
 * @property {string} count
 * @property {string} CV
 * @property {string} MAIL
 * @property {string} DECISION
 */

/** @type {Collection} */
export const Collection = {
     "COUNT": "count",
	"CV":"cv",
	"MAIL":"mail",
	"DECISION":"decision"
}

/**
 * @typedef {Object} MongoQueryFrom
 *
 * @property {string} COUNT
 * @property {string} CV
 * @property {string} MAIL
 * @property {string} DECISION
 */

/** @type {MongoQueryFrom} */
export const MongoQueryFrom = {
     "COUNT": Db.RESUME + "." + Collection.COUNT,
     "CV": Db.RESUME + "." + Collection.CV,
	"MAIL":Db.RESUME + "." + Collection.MAIL,
	"DECISION":Db.RESUME + "." + Collection.DECISION,
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
 * @property {string} RESUME - RESUME modülü
 * @property {string} UTILITY - RESUME modülü
 * @property {string} NOTIFICATION - RESUME modülü
 */

/** @type {Modules} */
export const Modules = {
     "RESUME": "Resume",
	"UTILITY": "Utility",
	"NOTIFICATION":"Notification"
}
