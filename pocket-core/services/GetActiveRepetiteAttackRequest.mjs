import { GeneralKeys, MongoQueryFrom, Operator, PocketLib, Status } from "../util/constants.js";
const { PocketLog, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket GetActiveRepetiteAttackRequest servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const GetActiveRepetiteAttackRequest = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "ip");

          let filter = new PocketQueryFilter();
          filter.add("ip", criteria.get("ip", String)).operator(Operator.EQ);
          filter.add(GeneralKeys.STATUS, Status.ACTIVE).operator(Operator.EQ);

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.COMPLIANCE_REQUEST,
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          if (searchResult.length === 0) {
               PocketLog.error("No search result");
          }
          return searchResult[0];
     } catch (error) {
          PocketLog.error(`GetActiveRepetiteAttackRequest servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default GetActiveRepetiteAttackRequest;