import PocketLog from "../../../pocket-core/PocketLog.js";
import PocketMongo from "../../../pocket-core/PocketMongo.js";
import PocketQueryFilter from "../../../pocket-core/PocketQueryFilter.js";
import PocketService, { execute } from "../../../pocket-core/PocketService.js";
import PocketRemoteRequest from "../../../pocket-core/PocketRemoteRequest.js";

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const IpService = execute(async (criteria) => {
     try {
          try {
               const responseIp = await PocketRemoteRequest.execute("https://freeipapi.com/api/json","GET");
               return responseIp;
          } catch (error) {
               PocketLog.error("IpService servisinde hata meydana geldi." + error);
               throw new Error(error);
          }
     } catch (error) {
          PocketLog.error("IpService servisinde hata meydana geldi." + error);
          throw new Error(error);
     }
});

export default IpService;