import { Modules, PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket UserRegister servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const UserRegister = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "MANDATORY_KEY");

          const responseService = await PocketService.executeService(`GetUserService`,Modules.ADMIN,`PARAMETER_POCKET`);

          if(responseService.length != 0){

          }

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
          PocketLog.error(`UserRegister servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default UserRegister;