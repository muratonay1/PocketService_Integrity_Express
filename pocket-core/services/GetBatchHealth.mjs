import { PocketLib } from "../util/constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket GetBatchHealth servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const GetBatchHealth = execute(async (criteria) => {
     try {
          let batchHealthPocket = Pocket.create();
          PocketLog.info("GetBatchhealt servisinde info fırlatıldı")

          let filter = new PocketQueryFilter();
          filter.add("appName","batch").operator("==");

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: "admin.apiHealth",
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });
          batchHealthPocket.put("health","OK");
          if(searchResult.length != 0){
               let source = searchResult[0].details.message;
               batchHealthPocket.put("health",searchResult[0].eventType+"("+source+")")
          }

          return batchHealthPocket;


     } catch (error) {
          PocketLog.error(`GetBatchHealth servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default GetBatchHealth;