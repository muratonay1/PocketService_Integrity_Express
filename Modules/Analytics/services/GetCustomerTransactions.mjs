import PocketLog from "../../../pocket-core/PocketLog.js";
import Pocket from "../../../pocket-core/Pocket.js";
import PocketMongo from "../../../pocket-core/PocketMongo.js";
import PocketQueryFilter from "../../../pocket-core/PocketQueryFilter.js";
import PocketService, { execute } from "../../../pocket-core/PocketService.js";
import { Modules, MongoQueryFrom } from "../constants.js";

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const GetCustomerTransactions = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "username");

          const searchCustomer = await new Promise((resolve, reject) => {
               let searchCustomerPocket = new Pocket();
               searchCustomerPocket.put("username", criteria.get("username", ""))
               PocketService.executeService("SearchCustomerByUserName", Modules.ANALYTICS, searchCustomerPocket, (responseCustomerInfo) => {
                    resolve(responseCustomerInfo.data);
               })
          });

          if (searchCustomer.length === 0) {
               PocketLog.error("No search result");
          }

          let customerAccounts = searchCustomer[0].accounts;
          let customerAllAccountLists = [];

          const promises = customerAccounts.map(custAcc => {
               return PocketService.executeAsyncService("SearchTransactionByAccountId", Modules.ANALYTICS, new Pocket().put("account_id", custAcc));
          });

          customerAllAccountLists = await Promise.all(promises);
          let transactionsArrays =[].concat(...customerAllAccountLists).map(i=>i.transactions);
          const flattenedArray = [].concat(...transactionsArrays);
          return flattenedArray;


     } catch (error) {
          PocketLog.error("GetCustomerTransactions servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});

export default GetCustomerTransactions;