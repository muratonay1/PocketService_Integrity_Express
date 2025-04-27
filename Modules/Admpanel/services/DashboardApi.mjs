import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket DashboardApi servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const DashboardApi = execute(async (criteria) => {
     try {

          let responseDashboard = Pocket.create();
          let endpointCriteria = Pocket.create();
          endpointCriteria.put("status", "1");
          const now = new Date();
          const dayBefore = 7;

          const startDate = new Date();
          startDate.setDate(now.getDate() - dayBefore);

          const formatDate = (date) => {
               const year = date.getFullYear();
               const month = String(date.getMonth() + 1).padStart(2, '0');
               const day = String(date.getDate()).padStart(2, '0');
               const hours = String(date.getHours()).padStart(2, '0');
               const minutes = String(date.getMinutes()).padStart(2, '0');
               const seconds = String(date.getSeconds()).padStart(2, '0');
               return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
          };

          let logCriteria = Pocket.create();
          logCriteria.put("startDate", formatDate(startDate));

          const responses = await PocketService.executeAsyncBlock(async (asyncService) => {
               await asyncService.execute(`GetEndpoints`, `Admin`, endpointCriteria, true);
               await asyncService.execute(`GetBatchJobs`, 'Pocket', {}, true);
               await asyncService.execute(`GetAllServerInfo`, 'Admin', {}, true);
               await asyncService.execute(`GetBatchHealth`, 'Admin', {}, true);
               await asyncService.execute(`GetPocketLog`, 'AdmPanel', logCriteria, true);
          });

          responseDashboard.put("endpoints", responses.GetEndpoints.get("data"));
          responseDashboard.put("batchs", responses.GetBatchJobs.get("data"));
          responseDashboard.put("serverInfo", responses.GetAllServerInfo.get("data").length);
          responseDashboard.put("batchHealth", responses.GetBatchHealth.get("data.health"));
          responseDashboard.put("logData", responses.GetPocketLog.get("data"));

          return responseDashboard;
     } catch (error) {
          PocketLog.error(`DashboardApi servisinde hata meydana geldi."` + error);
          throw new Error(error.message);
     }
});

export default DashboardApi;