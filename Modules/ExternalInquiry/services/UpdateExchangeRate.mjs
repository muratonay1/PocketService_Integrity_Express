import { MongoQueryFrom, PocketLib } from "../constants.js";
const {
     PocketConfigManager,
     PocketLog,
     PocketMongo,
     PocketQueryFilter,
     PocketService,
     execute,
     dbClient,
     Pocket,
     PocketUtility,
     PocketRemoteRequest
} = PocketLib;

/**
 * Pocket UpdateExchangeRate servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const UpdateExchangeRate = execute(async (criteria) => {
     try {

          const remoteResponse = await PocketRemoteRequest.execute("https://finans.truncgil.com/today.json", "GET")

          let insertPocket = PocketUtility.ConvertToPocket(remoteResponse);
          insertPocket.put("insertDate", PocketUtility.GetRealDate())
          insertPocket.put("insertTime", PocketUtility.GetRealTime())
          // insertResult success:true, fail:false
          const insertResult = await new Promise((resolve, reject) => {
               dbClient.executeInsert({
                    from: MongoQueryFrom.FOREIGN_EXCHANGE,
                    params: remoteResponse,
                    done: resolve,
                    fail: reject
               });
          });
          return insertResult;
     } catch (error) {
          PocketLog.error("UpdateExchangeRate servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});

export default UpdateExchangeRate;