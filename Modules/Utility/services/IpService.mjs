import { PocketLib } from "../constants.js";
const {PocketLog,execute,PocketRemoteRequest} = PocketLib;

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const IpService = execute(async (criteria) => {
     try {
          try {
               console.log(criteria.ip +", ip sorgulama işlemi yapıyor.");
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