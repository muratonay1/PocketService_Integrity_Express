import { Operator, PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket, PocketUtility } = PocketLib;

/**
 * Pocket UserSearch servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const UserUpdate = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "username,email");

          let filter = new PocketQueryFilter();
          filter.add("email", criteria.email).operator(Operator.EQ);
          filter.add("username",criteria.username).operator(Operator.EQ);

          // updateResult success:true, fail:false
          const updateResult = await new Promise((resolve, reject) => {
               dbClient.executeUpdate({
                    from: "pocket.ui_user",
                    where: filter,
                    params: criteria,
                    done: resolve,
                    fail: reject
               });
          });

          if(!updateResult){
               throw new Error("Kullanıcı güncellenirken hata oluştu");
          }

          return true;

     } catch (error) {
          PocketLog.error(`UserSearch servisinde hata meydana geldi."` + error);
          throw new Error(error.message);
     }
});

export default UserUpdate;