import PocketLog from "../../../pocket-core/PocketLog.js";
import PocketMongo from "../../../pocket-core/PocketMongo.js";
import PocketQueryFilter from "../../../pocket-core/PocketQueryFilter.js";
import PocketService from "../../../pocket-core/PocketService.js";
import { MongoQueryFrom } from "../constants.js";
/**
 *
 * @param {Pocket} criteria
 */
const SearchAccountByAccountId = async (criteria) => {
     try {

          PocketService.parameterMustBeFill(criteria, "account_id");

          let dbClient= new PocketMongo();

          let filter = new PocketQueryFilter();

          filter.add("account_id",criteria.get("account_id",String)).operator("==");

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet(
                    {
                         from: MongoQueryFrom.ACCOUNTS,
                         where: filter,
                         done:resolve,
                         fail:reject
                    }
               )
          });

          if(searchResult.length == 0){
               PocketLog.error("Aradığınız kritere uygun başvuru bulunamadı.");
          }
          return searchResult;

     } catch (error) {
          PocketLog.error("SearchAccountByAccountId servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
};

export default SearchAccountByAccountId;