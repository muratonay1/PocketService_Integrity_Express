import PocketUtility from "../../../pocket-core/PocketUtility.js";
import { GeneralKeys, PocketLib, Status, Modules } from "../constants.js";
const { PocketLog, PocketService, execute, Pocket } = PocketLib;

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

          const activeRepetiteAttack = await PocketService.executeService(`GetActiveRepetiteAttackRequest`, Modules.ADMIN, activePocket);

          if (PocketUtility.isEmptyObject(activeRepetiteAttack.data)) {
               PocketLog.info("Aktif tehdit kaydı bulunamadı. Mevcut atak kaydı, aktif kayıt olarak kaydedilecek.");
               criteria.put("retrieve", 1);
               const saveRepetiteAttackResponse = await PocketService.executeService(`SaveRepetiteAttackRequest`, Modules.ADMIN, criteria);
               if (saveRepetiteAttackResponse) {
                    return criteria;
               }
          }
          else {
               if(activeRepetiteAttack.data.retrieve + 1 >= 3){
                    returnData["isRisked"] = true;
                    return returnData;
               }
               let updatedData = Pocket.create();
               updatedData.put("ip", activeRepetiteAttack.data.ip);
               updatedData.put(GeneralKeys.STATUS, Status.PASSIVE);

               const updateRepetite = await PocketService.executeService(`UpdateRepetiteAttackRequest`, Modules.ADMIN, updatedData);

               if(updateRepetite){
                    let saveData = PocketUtility.ConvertToPocket(activeRepetiteAttack.data);
                    saveData.put("insertDate", PocketUtility.GetRealDate());
                    saveData.put("insertTime", PocketUtility.GetRealTime());
                    saveData.put("fullDate", PocketUtility.LoggerTimeStamp());
                    saveData.put("retrieve",activeRepetiteAttack.data.retrieve + 1)
                    saveData.put(GeneralKeys.STATUS,Status.ACTIVE);
                    const saveRepetite = await PocketService.executeService(`SaveRepetiteAttackRequest`, Modules.ADMIN, saveData);

                    if(saveRepetite){
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