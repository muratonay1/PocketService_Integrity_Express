import Pocket from "../../pocket-core/core/Pocket.js";
import PocketConfigManager from "../../pocket-core/core/PocketConfigManager.js";
import PocketList from "../../pocket-core/core/PocketList.js";
import PocketLog from "../../pocket-core/core/PocketLog.js";
import PocketMongo, { dbClient } from "../../pocket-core/core/PocketMongo.js";
import PocketQueryFilter from "../../pocket-core/core/PocketQueryFilter.js";
import PocketUtility from "../../pocket-core/core/PocketUtility.js";
import PocketResponse from "../../pocket-core/core/PocketResponse.js";
import PocketRemoteRequest from "../../pocket-core/core/PocketRemoteRequest.js";
import PocketService, { execute } from "../../pocket-core/core/PocketService.js";
import PocketBatchManager, { executeBatch } from "../../pocket-core/core/PocketBatchManager.js";

// PocketLib importer
export const PocketLib = {
     Pocket,
     PocketList,
     PocketConfigManager,
     PocketResponse,
     PocketMongo,
     PocketQueryFilter,
     PocketBatchManager,
     PocketRemoteRequest,
     PocketService,
     execute,
     executeBatch,
     PocketUtility,
     PocketLog,
     dbClient,
}

export const Modules = {
     "ANALYTICS":"Analytics",
     "NETFLIX":"Netflix"
}

export const Db = {
     "ANALYTICS":"analytics",
     "POCKET":"pocket"
}
export const Collection = {
     "ACCOUNTS":"accounts",
     "CUSTOMER":"customer",
     "TRANSACTIONS":"transactions",
     "EXCHANGE_RATE":"exchangeRate"
}

export const MongoQueryFrom = {
     "ACCOUNTS":Db.ANALYTICS + "." + Collection.ACCOUNTS,
     "CUSTOMER":Db.ANALYTICS + "." + Collection.CUSTOMER,
     "TRANSACTIONS":Db.ANALYTICS + "." + Collection.TRANSACTIONS,
     "EXCHANGE_RATE":Db.POCKET + "." + Collection.EXCHANGE_RATE
}