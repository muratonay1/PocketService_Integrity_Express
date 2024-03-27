import Pocket from "../../pocket-core/Pocket.js";
import PocketConfigManager from "../../pocket-core/PocketConfigManager.js";
import PocketList from "../../pocket-core/PocketList.js";
import PocketLog from "../../pocket-core/PocketLog.js";
import PocketMongo, { dbClient } from "../../pocket-core/PocketMongo.js";
import PocketQueryFilter from "../../pocket-core/PocketQueryFilter.js";
import PocketUtility from "../../pocket-core/PocketUtility.js";
import PocketResponse from "../../pocket-core/PocketResponse.js";
import PocketRemoteRequest from "../../pocket-core/PocketRemoteRequest.js";
import PocketService, { execute } from "../../pocket-core/PocketService.js";
import PocketBatchManager, { executeBatch } from "../../pocket-core/PocketBatchManager.js";

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