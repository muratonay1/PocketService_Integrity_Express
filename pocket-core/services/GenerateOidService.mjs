import { PocketLib } from "../util/constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket, PocketUtility } = PocketLib;

/**
 * Pocket GenerateOidService servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const GenerateOidService = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "module,type");

          let oid = PocketUtility.GenerateOID();

          let generatedOid = {
               oid            :    PocketUtility.GenerateOID(),
               createDate     :    PocketUtility.GetRealDate(),
               createTime     :    PocketUtility.GetRealTime(),
               createdAt      :    PocketUtility.TimeStamp(),
               module         :    criteria.get("module",String),
               type           :    criteria.get("type",String)
          }

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
          PocketLog.error(`GenerateOidService servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default GenerateOidService;