import PocketConfigManager from "../../pocket-core/core/PocketConfigManager.js";
import PocketLog from "../../pocket-core/core/PocketLog.js";
import Pocket from "../../pocket-core/core/Pocket.js";
import PocketUtility from "../../pocket-core/core/PocketUtility.js";
import PocketRemoteRequest from "../../pocket-core/core/PocketRemoteRequest.js";
import PocketMongo, { dbClient } from "../../pocket-core/core/PocketMongo.js";
import PocketQueryFilter from "../../pocket-core/core/PocketQueryFilter.js";
import PocketService, { execute } from "../../pocket-core/core/PocketService.js";
import PocketBatchManager, { executeBatch } from "../../pocket-core/core/PocketBatchManager.js";

// PocketLib importer
export const PocketLib = {
	PocketConfigManager,
	PocketLog,
	PocketMongo,
	PocketQueryFilter,
	PocketService,
	PocketUtility,
	PocketRemoteRequest,
	PocketBatchManager,
	execute,
	executeBatch,
	dbClient,
	Pocket
};

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