import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket GenerateToken servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const GenerateToken = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "MANDATORY_KEY");

          const responseService = await PocketService.executeService(`SERVICE_NAME`,`MODULE_NAME`,`PARAMETER_POCKET`);

          let filter = new PocketQueryFilter();
          filter.add("MANDATORY_KEY", criteria.get("MANDATORY_KEY", String)).operator("==");

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MONGO_QUERY_FROM_URL,
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          if (searchResult.length === 0) {
               PocketLog.error("No search result");
          }
          return searchResult;
     } catch (error) {
          PocketLog.error(`GenerateToken servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default GenerateToken;