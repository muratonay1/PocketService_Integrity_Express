import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket SaveUserService servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const SaveUserService = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "userMail,userPassword");

          // insertResult success:true, fail:false
          const insertResult = await new Promise((resolve, reject) => {
               dbClient.executeInsert({
                    from: "community.users",
                    params: criteria,
                    done: resolve,
                    fail: reject
               });
          });

          if (insertResult) {
               return true;
          }
          return false;
     } catch (error) {
          PocketLog.error(`SaveUserService servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default SaveUserService;