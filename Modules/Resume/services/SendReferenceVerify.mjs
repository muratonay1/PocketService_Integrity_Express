import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket,PocketUtility } = PocketLib;

/**
 * Pocket SendReferenceVerify servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const SendReferenceVerify = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "firstName,lastName,profession,tag,workplace,email,linkedin,referenceCheck,token");

          if(!criteria.referenceCheck){
               throw new Error("Referans onayı alınamadı. Bağlantı devredışı bırakıldı.")
          }
          let searchRefTokenPocket = Pocket.create();
          searchRefTokenPocket.put("referenceToken",criteria.token);
          searchRefTokenPocket.put("status","1");

          const searchReferenceResponse = await PocketService.executeService(`SearchReferenceToken`, 'Resume', searchRefTokenPocket);

          if(PocketUtility.isEmptyObject(searchReferenceResponse.data)){
               throw new Error("Token bilgisi hatalı. Lütfen size gönderilen token ile işlem yapınız.")
          }

          let currentToken = searchReferenceResponse.data;

          currentToken.status = "0";
          currentToken.verify

          await PocketService.executeService("UpdateReferenceToken", 'Resume', )

          let filter = new PocketQueryFilter();
          filter.add("MANDATORY_KEY", criteria.get("MANDATORY_KEY", String)).operator("==");

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: MONGO_QUERY_FROM_URL,
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          if (searchResult.length === 0) {
               PocketLog.error("No search result");
          }
          return searchResult;
     } catch (error) {
          PocketLog.error(`SendReferenceVerify servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default SendReferenceVerify;