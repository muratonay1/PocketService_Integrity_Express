import { MongoQueryFrom, PocketLib } from "../constants.js";
const {
     Pocket,
     PocketQueryFilter,
     PocketService,
     PocketUtility,
     execute,
     PocketLog,
     dbClient

} = PocketLib;

/**
 * LogoutService, kullanıcıların oturumlarını sonlandırmak için kullanılan bir Pocket servisidir.
 * Kullanıcı adını temel alarak, kullanıcının oturumunu sonlandırır.
 * @param {Pocket} criteria - Oturumu sonlandırmak için gerekli kriterlerin bulunduğu Pocket nesnesi.
 * @returns {Promise<boolean>} - Oturumun başarıyla sonlandırılması durumunda true, aksi takdirde false döner.
 */
const LogoutService = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "name");

          let dbClient = new PocketMongo();

          let userFilter = new PocketQueryFilter();
          userFilter.add("name", criteria.get("name", String)).operator("==");

          const userResponse = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.USERS,
                    where: userFilter,
                    done: resolve,
                    fail: reject
               });
          });

          if (userResponse.length == 0) {
               throw new Error("User is not defined.");
          }

          let filter = new PocketQueryFilter();
          filter.add("name", criteria.get("name", String)).operator("==");

          const sessionResponse = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.SESSION,
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          if (sessionResponse.length == 0) {
               throw new Error("User session is already logged out.")
          }

          let deleteFilter = new Pocket();
          deleteFilter.put("name", criteria.get("name", String))

          const deleteInfo = await new Promise((resolve, reject) => {
               dbClient.executeDelete({
                    from: MongoQueryFrom.SESSION,
                    where: deleteFilter,
                    done: resolve,
                    fail: reject
               });
          });

          if (!deleteInfo) {
               throw new Error("User session is not logged.!!");
          }

          PocketLog.info("User session is logged out succesfully.");

          return true;

     } catch (error) {
          PocketLog.error("LogoutService servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});

export default LogoutService;
