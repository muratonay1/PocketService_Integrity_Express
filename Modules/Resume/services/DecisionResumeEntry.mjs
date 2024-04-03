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
          PocketService.parameterMustBeFill(criteria, "ip");

          let ipContextCriteria = Pocket.create();

          ipContextCriteria.put("ip", criteria.ip);

          const responseIp = await PocketService.executeService("FindIpContext", Modules.RESUME, ipContextCriteria);

          let isFirstEntry = false;
          // Giriş ilk defa gerçekleşiyorsa
          if (PocketUtility.isEmptyObject(responseIp.data))
          {
               PocketLog.info("First entry to the CV site detected. IP: " + criteria.ip);
               isFirstEntry = true;
          }

          let saveDecisionPocket = Pocket.create();

          saveDecisionPocket.put("ip", criteria.ip);
          saveDecisionPocket.put("isFirst",isFirstEntry);

          const saveDecision = await PocketService.executeService("SaveDecisionResume", Modules.RESUME, saveDecisionPocket);

          PocketLog.info("Recorded in the decision mechanism. IP: " + criteria.ip);

          if(isFirstEntry) return true;

          if(saveDecision.data.entryCount % 10 == 0 )
          {
               PocketLog.warn("Aşırı istek tespit edildi. IP: "+ criteria.ip);
               let sendTrafficPocket = PocketUtility.ConvertToPocket(saveDecision.data);
               await PocketService.executeService("SendResumeMailForSuspicious", Modules.NOTIFICATION, sendTrafficPocket);
               return false;
          }
          return true;

     } catch (error) {
          PocketLog.error(`DecisionResumeEntry servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default DecisionResumeEntry;