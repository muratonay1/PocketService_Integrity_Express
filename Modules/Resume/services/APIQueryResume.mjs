import { Modules, PocketLib } from "../constants.js";
const { PocketLog, PocketService, execute, Pocket } = PocketLib;

/**
 * Pocket APIQueryResume servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const APIQueryResume = execute(async (criteria) => {
     try {
          let criteriaContext = Pocket.create();
          criteriaContext.put("ip", criteria.ip);
          const contextControl = await PocketService.executeService("FindIpContext", Modules.RESUME, criteriaContext);
          if (contextControl.data.entryCount % 10 == 0) {
               return [];
          }

          const responseService = await PocketService.executeService("GetResumeData", Modules.RESUME);

          const resultCv = responseService.data
               .map(item => ({
                    key: item.unique,
                    data: item
               }));

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