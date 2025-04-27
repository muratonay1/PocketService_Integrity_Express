import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket GetEndpoints servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const GetEndpoints = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "status");

          const responseService = await PocketService.executeService(`GetServerInfo`,'Admin');

          let apis = responseService.data.activeApi;

          if (apis.length === 0) {
               PocketLog.error("No search result");
          }
          return apis;
     } catch (error) {
          PocketLog.error(`GetEndpoints servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default GetEndpoints;