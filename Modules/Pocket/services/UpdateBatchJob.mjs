import { PocketLib,Modules, MongoQueryFrom, Operator, GeneralKeys } from "../constants.js";
const { PocketLog, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket UpdateBatchJob servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const UpdateBatchJob = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "module,handler");
          PocketService.parameterMustBeFill(criteria, "params");

          let getBatchCriteria = Pocket.create();
          getBatchCriteria.put(GeneralKeys.MODULE,criteria.module);
          getBatchCriteria.put(GeneralKeys.HANDLER,criteria.handler);

          const responseService = await PocketService.executeService("GetBatchJobWithParameter", Modules.POCKET, getBatchCriteria);

          let activeJob = responseService.data;

          Object.assign(activeJob,criteria.params);

          let updateBatchFilter = new PocketQueryFilter();
          updateBatchFilter.add(GeneralKeys.MODULE,criteria.module).operator(Operator.EQ);
          updateBatchFilter.add(GeneralKeys.HANDLER,criteria.handler).operator(Operator.EQ);

          // updateResult success:true, fail:false
          const updateResult = await new Promise((resolve, reject) => {
               dbClient.executeUpdate({
                    from: MongoQueryFrom.BATCH_DEFINATION,
                    where: updateBatchFilter,
                    params: activeJob,
                    done: resolve,
                    fail: reject
               });
          });

          return updateResult;

     } catch (error) {
          PocketLog.error(`UpdateBatchJob servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default UpdateBatchJob;