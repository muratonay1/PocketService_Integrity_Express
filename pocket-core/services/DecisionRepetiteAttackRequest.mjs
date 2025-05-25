import PocketService, {execute} from "../core/PocketService.js";
import PocketUtility from '../core/PocketUtility.js';
import Pocket from '../core/Pocket.js';
/**
 * Pocket DecisionRepetiteAttackRequest servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const DecisionRepetiteAttackRequest = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "ip");

          let returnData = {};

          let activePocket = Pocket.create();
          activePocket.put("ip", criteria.get("ip", String));

          const activeRepetiteAttack = await PocketService.executeService(`GetActiveRepetiteAttackRequest`, "pocket-core", activePocket);

          if (PocketUtility.isEmptyObject(activeRepetiteAttack.data)) {
               PocketLog.info("Aktif tehdit kaydı bulunamadı. Mevcut atak kaydı, aktif kayıt olarak kaydedilecek.");
               criteria.put("retrieve", 1);
               criteria.put("status","1");
               const saveRepetiteAttackResponse = await PocketService.executeService(`SaveRepetiteAttackRequest`, "pocket-core", criteria);
               if (saveRepetiteAttackResponse) {
                    returnData["isRisked"] = false;
                    return returnData;
               }
          }
          else {
               if(activeRepetiteAttack.data.retrieve + 1 >= 3){
                    returnData["isRisked"] = true;
                    return returnData;
               }
               let updatedData = Pocket.create();
               updatedData.put("ip", activeRepetiteAttack.data.ip);
               updatedData.put("status", "0");

               const updateRepetite = await PocketService.executeService(`UpdateRepetiteAttackRequest`, "pocket-core", updatedData);

               if(updateRepetite.data){
                    let saveData = PocketUtility.ConvertToPocket(activeRepetiteAttack.data);
                    saveData.put("insertDate", PocketUtility.GetRealDate());
                    saveData.put("insertTime", PocketUtility.GetRealTime());
                    saveData.put("fullDate", PocketUtility.LoggerTimeStamp());
                    saveData.put("retrieve",activeRepetiteAttack.data.retrieve + 1)
                    saveData.put("status","1");
                    const saveRepetite = await PocketService.executeService(`SaveRepetiteAttackRequest`, "pocket-core", saveData);

                    if(saveRepetite.data){
                         returnData["isRisked"] = false;
                         return returnData;
                    }
               }

          }
          returnData["isRisked"] = false;
          return returnData;
     } catch (error) {
          PocketLog.error(`DecisionRepetiteAttackRequest servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default DecisionRepetiteAttackRequest;