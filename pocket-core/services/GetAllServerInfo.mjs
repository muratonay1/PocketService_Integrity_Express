import { MongoQueryFrom, PocketLib } from "../util/constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket GetAllServerInfo servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const GetAllServerInfo = execute(async (criteria) => {
     try {

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.SERVER_INFO,
                    where: new PocketQueryFilter(),
                    done: resolve,
                    fail: reject
               });
          });

          if (searchResult.length === 0) {
               PocketLog.error("No search result");
          }
          return searchResult;
     } catch (error) {
          PocketLog.error(`GetAllServerInfo servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default GetAllServerInfo;