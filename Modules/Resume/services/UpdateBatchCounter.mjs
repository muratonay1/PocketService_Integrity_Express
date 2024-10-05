import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket UpdateBatchCounter servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const UpdateBatchCounter = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "batch_counter");

          let filter = new PocketQueryFilter();
          filter.add("unique", "batch_counter").operator("==");

          let updatePocket = Pocket.create();
          updatePocket.put("batch_counter",criteria.batch_counter)

          const updateResult = await new Promise((resolve, reject) => {
               dbClient.executeUpdate({
                    from: MongoQueryFrom.COUNT,
                    where: filter,
                    params: updatePocket,
                    done: resolve,
                    fail: reject
               });
          });

          if (updateResult) {
               return updateResult
          }
     } catch (error) {
          PocketLog.error(`UpdateBatchCounter servisinde hata meydana geldi.` + error);
          throw new Error(error);
     }
});

export default UpdateBatchCounter;