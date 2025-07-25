import { PocketLib } from "../util/constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket CheckTokenEndpointAuth servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const CheckTokenEndpointAuth = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "token");

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
          PocketLog.error(`CheckTokenEndpointAuth servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default CheckTokenEndpointAuth;