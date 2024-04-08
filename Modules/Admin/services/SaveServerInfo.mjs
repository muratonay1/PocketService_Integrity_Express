import { Modules, MongoQueryFrom, Operator, Status, PocketLib } from "../constants.js";

const {
     Pocket,
     PocketQueryFilter,
     PocketService,
     PocketConfigManager,
     PocketUtility,
     execute,
     PocketLog,
     dbClient

} = PocketLib;

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const SaveServerInfo = execute(async (criteria) => {
     try {

          const serviceResponse = await PocketService.executeService(`GetServerInfo`,Modules.ADMIN,Pocket.create());
          let getData;
          getData = serviceResponse.data;
          if(PocketUtility.isEmptyObject(getData)){
               getData = {
                    "_id":PocketUtility.GenerateOID(),
                    "unique":PocketUtility.encrypt(PocketUtility.GenerateOID()),
                    "created":PocketUtility.LoggerTimeStamp(),
                    "updated":PocketUtility.LoggerTimeStamp(),
                    "port":PocketConfigManager.getApiPort(),
                    "status":Status.ACTIVE,
                    "activeApi":PocketConfigManager.getApiList()
               };

               const insertFirstDefination = await new Promise((resolve, reject) => {
                    dbClient.executeInsert({
                         from: MongoQueryFrom.SERVER_INFO,
                         params: getData,
                         done: resolve,
                         fail: reject
                    });
               });

               if(insertFirstDefination) return insertFirstDefination;
               else throw new Error("First defination server info failure");
          }

          let filterUpdate = new PocketQueryFilter();
          filterUpdate.add("unique",getData.unique).operator(Operator.EQ);

          let updateParams = {
               "status":Status.PASSIVE,
               "updated":PocketUtility.LoggerTimeStamp()
          };

          // updateResult success:true, fail:false
          const updateResult = await new Promise((resolve, reject) => {
               dbClient.executeUpdate({
                    from: MongoQueryFrom.SERVER_INFO,
                    where: filterUpdate,
                    params: updateParams,
                    done: resolve,
                    fail: reject
               });
          });

          if(!updateResult){
               throw new Error("Update Api Logs Error");
          }

          getData.status = Status.ACTIVE;
          getData.created = PocketUtility.LoggerTimeStamp();
          getData.updated = PocketUtility.LoggerTimeStamp();
          getData["_id"] = PocketUtility.GenerateOID();
          getData["unique"] = PocketUtility.encrypt(PocketUtility.GenerateOID());
          getData["activeApi"] = PocketConfigManager.getApiList();

          // insertResult success:true, fail:false
          const insertResult = await new Promise((resolve, reject) => {
               dbClient.executeInsert({
                    from: MongoQueryFrom.SERVER_INFO,
                    params: getData,
                    done: resolve,
                    fail: reject
               });
          });

          if (!insertResult) {
               throw new Error("İnsert Api Logs Error");
          }

          return insertResult;

     } catch (error) {
          PocketLog.error(`SaveServerInfo servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default SaveServerInfo;