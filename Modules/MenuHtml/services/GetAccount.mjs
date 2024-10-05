import { MongoQueryFrom, Operator, PocketLib } from "../constants.js";
const { PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket GetAccount servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const GetAccount = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "userName,password");

          let filter = new PocketQueryFilter();
          filter.add("userName", criteria.get("userName", String)).operator(Operator.EQ);
          filter.add("password", criteria.get("password", String)).operator(Operator.EQ);

          const accountResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.ACCOUNTS,
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          if (accountResult.length === 0) {
               throw new Error("User [ " + criteria.get("userName","")+ " ]" + " is not found");
          }
          return accountResult[0];
     } catch (error) {
          PocketLog.error(`GetAccount servisinde hata meydana geldi."` + error);
          throw new Error(error.message);
     }
});

export default GetAccount;