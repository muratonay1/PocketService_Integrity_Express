import { PocketLib } from "../constants.js";
const { execute } = PocketLib;

/**
 * Pocket ApiPocketVerifyLoginOTP servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const ApiPocketVerifyLoginOTP = execute(async (criteria) => {

          /*
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
          }*/

     return true;
});

export default ApiPocketVerifyLoginOTP;