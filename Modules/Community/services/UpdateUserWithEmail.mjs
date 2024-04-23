import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket UpdateUserWithEmail servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const UpdateUserWithEmail = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "email");

          let filter = new PocketQueryFilter();
          filter.add("userMail", criteria.get("email", String)).operator("==");

          // updateResult success:true, fail:false
          const updateResult = await new Promise((resolve, reject) => {
               dbClient.executeUpdate({
                    from: "community.users",
                    where: filter,
                    params: criteria.params,
                    done: resolve,
                    fail: reject
               });
          });

          return updateResult;
     } catch (error) {
          PocketLog.error(`UpdateUserWithEmail servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default UpdateUserWithEmail;