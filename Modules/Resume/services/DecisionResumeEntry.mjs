import PocketUtility from "../../../pocket-core/PocketUtility.js";
import { Modules, PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket DecisionResumeEntry servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const DecisionResumeEntry = execute(async (criteria) => {
     try {
          console.log("decision girdi. IP: ")
          console.log(criteria.ip);
          PocketService.parameterMustBeFill(criteria, "ip");

          let ipContextCriteria = Pocket.create();

          ipContextCriteria.put("ip", criteria.ip);

          console.log("FindIpContext request pocket: ")
          console.log(ipContextCriteria);
          const responseIp = await PocketService.executeService("FindIpContext", Modules.RESUME, ipContextCriteria);

          console.log("FindIpContext Sonuç döndü: ");
          console.log(responseIp.data);
          let isFirstEntry = false;
          // Giriş ilk defa gerçekleşiyorsa
          if (PocketUtility.isEmptyObject(responseIp.data))
          {
               console.log("İLK GİRİŞ")
               PocketLog.info("First entry to the CV site detected. IP: " + criteria.ip);
               isFirstEntry = true;
          }

          let saveDecisionPocket = Pocket.create();

          saveDecisionPocket.put("ip", criteria.ip);
          saveDecisionPocket.put("isFirst",isFirstEntry);

          console.log("SaveDecisionResume ÇAĞRILIYOR. parametresi aşağıda: ")
          console.log(saveDecisionPocket);
          const saveDecision = await PocketService.executeService("SaveDecisionResume", Modules.RESUME, saveDecisionPocket);
          console.log("SaveDecisionResume çağrıldı ve sonuç döndü.");
          console.log(saveDecision);
          PocketLog.info("Recorded in the decision mechanism. IP: " + criteria.ip);

          if(isFirstEntry) return true;


          if(saveDecision.data.entryCount == 10 )
          {
               PocketLog.warn("Aşırı istek tespit edildi. IP: "+ criteria.ip);
               return false;
          }
          console.log("DecisionResumeEntry bitti.");
          return true;

     } catch (error) {
          PocketLog.error(`DecisionResumeEntry servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default DecisionResumeEntry;