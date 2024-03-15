import PocketLog from "../../../pocket-core/PocketLog.js";
import PocketMongo,{dbClient} from "../../../pocket-core/PocketMongo.js";
import PocketQueryFilter from "../../../pocket-core/PocketQueryFilter.js";
import PocketService, { execute } from "../../../pocket-core/PocketService.js";
import PocketUtility from "../../../pocket-core/PocketUtility.js";
import { MongoQueryFrom } from "../constants.js";

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const LoginService = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "name");

          const response = await PocketService.executeService("IpService","Utility")

          let filter = new PocketQueryFilter();
          filter.add("name", criteria.get("name", String)).operator("==");

          const userResponse = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.USERS,
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          if (userResponse.length === 0) {
               PocketLog.error("User cannot find.");
               throw new Error("Kullanici bulunamadi");
          }

          if(!userResponse[0].email_verified){
               PocketLog.error(criteria.get("name","") + " kullanicisi icin email dogrulamasi gerekli.");
               throw new Error(criteria.get("name","") + " kullanicisi icin email dogrulamasi gerekli.");
          }

          let filterSession = new PocketQueryFilter();
          filterSession.add("name", criteria.get("name", String)).operator("==");
          const sessionInfo = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.SESSION,
                    where: filterSession,
                    done: resolve,
                    fail: reject
               });
          });

          if(sessionInfo.length != 0){
               PocketLog.error(criteria.get("name","") + " kullanicisi ile aktif bir oturum mevcut.");
               throw new Error("User session is already used.");
          }

          userResponse[0]["sessionStartDate"] = PocketUtility.LoggerTimeStamp()
          const userLoginResponse = await new Promise((resolve, reject) => {
               dbClient.executeInsert({
                    from: MongoQueryFrom.SESSION,
                    params: userResponse[0],
                    done: resolve,
                    fail: reject
               });
          });

          if(userLoginResponse){
               return userResponse[0];
          }
          else{
               return {};
          }
     } catch (error) {
          PocketLog.error("LoginService servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
}

);

export default LoginService;