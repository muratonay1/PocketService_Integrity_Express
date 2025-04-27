import PocketUtility from "../../../pocket-core/PocketUtility.js";
import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket ApiPocketLogin servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const ApiPocketLogin = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "username,password");

          let searchUserQuery = Pocket.create();
          searchUserQuery.put("username",criteria.username);
          searchUserQuery.put("password",criteria.password);

          const responseUserService = await PocketService.executeService(`UserSearch`,`Pocket`,searchUserQuery);

          /*
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

          return responseUserService.data;
     } catch (error) {
          PocketLog.error(`ApiPocketLogin servisinde hata meydana geldi."` + error);
          throw new Error(error.message);
     }
});

export default ApiPocketLogin;