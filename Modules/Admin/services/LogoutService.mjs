import PocketLog from "../../../pocket-core/PocketLog.js";
import PocketMongo from "../../../pocket-core/PocketMongo.js";
import PocketQueryFilter from "../../../pocket-core/PocketQueryFilter.js";
import Pocket from "../../../pocket-core/Pocket.js";
import PocketService, { execute } from "../../../pocket-core/PocketService.js";
import PocketUtility from "../../../pocket-core/PocketUtility.js";
import { MongoQueryFrom } from "../constants.js";

/**
 * LogoutService, kullanıcıların oturumlarını sonlandırmak için kullanılan bir Pocket servisidir.
 * Kullanıcı adını temel alarak, kullanıcının oturumunu sonlandırır.
 * @param {Pocket} criteria - Oturumu sonlandırmak için gerekli kriterlerin bulunduğu Pocket nesnesi.
 * @returns {Promise<boolean>} - Oturumun başarıyla sonlandırılması durumunda true, aksi takdirde false döner.
 */
const LogoutService = execute(async (criteria) => {
     try {
          // Kullanıcı adı parametresi kontrol edilir, eksikse hata fırlatılır
          PocketService.parameterMustBeFill(criteria, "name");

          // MongoDB istemci nesnesi oluşturulur
          let dbClient = new PocketMongo();

          // Kullanıcıyı bulmak için filtre oluşturulur
          let userFilter = new PocketQueryFilter();
          userFilter.add("name", criteria.get("name", String)).operator("==");

          // Kullanıcı bilgileri MongoDB'den alınır
          const userResponse = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.USERS,
                    where: userFilter,
                    done: resolve,
                    fail: reject
               });
          });

          // Kullanıcı bulunamadıysa hata fırlatılır
          if (userResponse.length == 0) {
               throw new Error("User is not defined.");
          }

          // Oturumu bulmak için filtre oluşturulur
          let filter = new PocketQueryFilter();
          filter.add("name", criteria.get("name", String)).operator("==");

          // Oturum bilgileri MongoDB'den alınır
          const sessionResponse = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MongoQueryFrom.SESSION,
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          // Oturum bulunamadıysa hata fırlatılır
          if (sessionResponse.length == 0) {
               throw new Error("User session is already logged out.")
          }

          // Oturumu silmek için filtre oluşturulur
          let deleteFilter = new Pocket();
          deleteFilter.put("name", criteria.get("name", String))

          // Oturum MongoDB'den silinir
          const deleteInfo = await new Promise((resolve, reject) => {
               dbClient.executeDelete({
                    from: MongoQueryFrom.SESSION,
                    where: deleteFilter,
                    done: resolve,
                    fail: reject
               });
          });

          // Oturum başarıyla silinmezse hata fırlatılır
          if (!deleteInfo) {
               throw new Error("User session is not logged.!!");
          }

          // Oturum başarıyla sonlandırıldı mesajı loglanır
          PocketLog.info("User session is logged out succesfully.");

          // İşlem başarıyla tamamlandığı için true döner
          return true;

     } catch (error) {
          // Hata durumunda log kaydedilir ve hata fırlatılır
          PocketLog.error("LogoutService servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});

export default LogoutService;
