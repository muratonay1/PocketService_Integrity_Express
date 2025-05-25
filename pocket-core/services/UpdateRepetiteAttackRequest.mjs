import { GeneralKeys, MongoQueryFrom, Operator, PocketLib, Status } from "../util/constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket UpdateRepetiteAttackRequest servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const UpdateRepetiteAttackRequest = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "ip");

          let filter = new PocketQueryFilter();
          filter.add("ip", criteria.get("ip", String)).operator(Operator.EQ);
          filter.add(GeneralKeys.STATUS, Status.ACTIVE).operator(Operator.EQ);


          // updateResult success:true, fail:false
          const updateResult = await new Promise((resolve, reject) => {
               dbClient.executeUpdate({
                    from: MongoQueryFrom.COMPLIANCE_REQUEST,
                    where: filter,
                    params: criteria,
                    done: resolve,
                    fail: reject
               });
          });

          if (!updateResult) {
               PocketLog.error("UpdateRepetiteAttackRequest is failed.");
          }
          return updateResult;
     } catch (error) {
          PocketLog.error(`UpdateRepetiteAttackRequest servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default UpdateRepetiteAttackRequest;