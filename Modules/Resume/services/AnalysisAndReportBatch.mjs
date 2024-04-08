import { PocketLib, Modules } from "../constants.js";
const { PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, executeBatch, dbClient, Pocket } = PocketLib;

/**
 * Pocket AnalysisAndReportBatch servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const AnalysisAndReportBatch = executeBatch(async (criteria) => {
     try {

          const responseCounter = await PocketService.executeService(`GetCounter`, Modules.RESUME);

          let decisionCriteria = Pocket.create();
          decisionCriteria.put("insertDate", beforeDate(7)); // 1 hafta önceki tarih

          const lastEntryDecision = await PocketService.executeService("GetDecisionResume", Modules.RESUME, decisionCriteria);

          const responseMails = await PocketService.executeService("SearchMail", Modules.RESUME, decisionCriteria);


          /**
           * TODO: Bilgileri topladıktan sonra anlamlı bir bütün oluşturarak static bir html dosyasına bu bilgilerin
           * yansıtılması gerekiyor. Bilgilerin tablo olarak yansıtılması okunup incelenmesi açısından kolay bir yol.
           *
           * Bu html'in haftalık olarak batch ile mail olarak gönderilmesi gerekiyor.
           *
           */

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
          PocketLog.error(`AnalysisAndReportBatch servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

function beforeDate(days) {
     const currentDate = new Date();

     const beforeDate = new Date(currentDate.getTime() - days * 24 * 60 * 60 * 1000);

     const year = beforeDate.getFullYear();
     let month = beforeDate.getMonth() + 1;
     let day = beforeDate.getDate();

     if (month < 10) {
          month = '0' + month;
     }
     if (day < 10) {
          day = '0' + day;
     }

     return `${year}${month}${day}`;
}

export default AnalysisAndReportBatch;