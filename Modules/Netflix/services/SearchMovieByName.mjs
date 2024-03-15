import PocketService from "../../../pocket-core/PocketService.js";
import Pocket from "../../../pocket-core/Pocket.js";
import PocketList from "../../../pocket-core/PocketList.js";
import { Modules } from '../constants.js';
import PocketQueryFilter from "../../../pocket-core/PocketQueryFilter.js";
import PocketLog from "../../../pocket-core/PocketLog.js";

/**
 *
 * @param {Pocket} criteria
 */
const SearchMovieByName = async (criteria) => {
     try {

          PocketService.parameterMustBeFill(criteria,"username");

          let filter = new Pocket();
          filter.put("username", criteria.get("username",""));

          const responseAnalytics = await PocketService.executeService("GetAnalyticsCustomers", Modules.ANALYTICS, filter);

          if(responseAnalytics.length == 0){
               throw new Error("Customer does not exists in analytics");
          }

          return responseAnalytics.data;

     } catch (error) {
          PocketLog.error("SearchMovieByName servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
};

export default SearchMovieByName;