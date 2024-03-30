import { Modules, MongoQueryFrom, Operator, PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket UpdateCounter servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const UpdateCounter = execute(async (criteria) => {
     try {

          const decision = await PocketService.executeService("DecisionResumeEntry",Modules.RESUME,criteria);

          if(!decision.data){
               return false;
          }

          const responseCounter = await PocketService.executeService("GetCounter",Modules.RESUME);

          let plusedCounter = responseCounter.data + 1;

          let filter = new PocketQueryFilter();
          filter.add("unique","counter").operator(Operator.EQ);

          let updatePocket = Pocket.create();
          updatePocket.put("counter",plusedCounter)

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
               return plusedCounter;
          }
          throw new Error("An error occurred in the API counter update service. Please consult the system administrator.");
     } catch (error) {
          PocketLog.error(`UpdateCounter servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default UpdateCounter;