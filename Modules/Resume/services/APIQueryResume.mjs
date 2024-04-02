import { Modules, PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket APIQueryResume servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const APIQueryResume = execute(async (criteria) => {
     try {
          let criteriaContext = Pocket.create();
          criteriaContext.put("ip",criteria.ip);
          const contextControl = await PocketService.executeService("FindIpContext", Modules.RESUME, criteriaContext);

          if(contextControl.data.entryCount % 10 == 0){
               return [];
          }

          let keyList = [
               "about",
               "experience",
               "follows",
               "project",
               "skills"
          ];

          let resultCv = [];
          for(let iter = 0 ; iter < keyList.length ; iter++)
          {
               let criteria = Pocket.create();
               criteria.put("key",keyList[iter]);

               const responseService = await PocketService.executeService("GetResumeData", Modules.RESUME, criteria);

               let cvObject = {
                    "key":keyList[iter],
                    "data":responseService.data
               };

               resultCv.push(cvObject);
          }

          if (resultCv.length === 0) {
               PocketLog.error("No search result");
          }
          return resultCv;

     } catch (error) {
          PocketLog.error(`APIQueryResume servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default APIQueryResume;