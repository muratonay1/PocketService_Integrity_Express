import PocketUtility from "../../../pocket-core/PocketUtility.js";
import { MongoQueryFrom, Operator, PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket UpdateDecisionResume servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const UpdateDecisionResume = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "ip,params");

          let filter = new PocketQueryFilter();
          filter.add("ip", criteria.get("ip", String)).operator(Operator.EQ);

          let paramsPocket = PocketUtility.ConvertToPocket(criteria.params);

          const updateResult = await new Promise((resolve, reject) => {
               dbClient.executeUpdate({
                    from: MongoQueryFrom.DECISION,
                    where: filter,
                    params: paramsPocket,
                    done: resolve,
                    fail: reject
               });
          });

          if (updateResult) {
               return updateResult;
          }
          return false;
     } catch (error) {
          PocketLog.error(`UpdateDecisionResume servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default UpdateDecisionResume;