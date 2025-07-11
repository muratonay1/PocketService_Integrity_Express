import { Modules } from "../../Pocket/core/constants.js";
import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket GetBatchInfo servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const GetBatchInfo = execute(async (criteria) => {
     try {
          let responseBatchs = await PocketService.executeService(`GetBatchJobs`,Modules.POCKET,criteria)
          return responseBatchs.get("data");
     } catch (error) {
          PocketLog.error(`GetBatchInfo servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default GetBatchInfo;