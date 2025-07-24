import { MongoQueryFrom, Operator, PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket,PocketUtility } = PocketLib;

/**
 * Pocket UpdateCurrency servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const UpdateCurrency = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "currency_name,amount");

          let filter = new PocketQueryFilter();
          filter.add("currency_name", criteria.get("currency_name", String)).operator(Operator.EQ);

          let updatePocket = Pocket.create();
          updatePocket.put("amount",criteria.get("amount",String));
          updatePocket.put("insertTime",PocketUtility.GetRealTime());
          updatePocket.put("insertDate",PocketUtility.GetRealDate());

          const updateResult = await new Promise((resolve, reject) => {
               dbClient.executeUpdate({
                    from: MongoQueryFrom.CURRENCY,
                    where: filter,
                    params: updatePocket,
                    done: resolve,
                    fail: reject
               });
          });

          return updateResult;
     } catch (error) {
          PocketLog.error(`UpdateCurrency servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default UpdateCurrency;