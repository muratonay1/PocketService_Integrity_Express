import { ERROR_MESSAGE, MongoQueryFrom, GeneralKeys, Status, Operator, PocketLib } from "../constants.js";
const {
     Pocket,
     PocketResponse,
     PocketQueryFilter,
     PocketService,
     execute,
     PocketLog,
     dbClient

} = PocketLib;
/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const GetServerInfo = execute(async (criteria) => {
     try {

          let filter = new PocketQueryFilter();
          filter.add(GeneralKeys.STATUS,Status.ACTIVE).operator(Operator.EQ);

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.SERVER_INFO,
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          if (searchResult.length === 0) {
               PocketLog.error(ERROR_MESSAGE.NO_SERVER_INFO_ERROR_MESSAGE);
          }
          return searchResult[0];
     } catch (error) {
          PocketLog.error(`GetServerInfo servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default GetServerInfo;