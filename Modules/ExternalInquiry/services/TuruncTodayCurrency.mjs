import { PocketLib } from "../constants.js";
const { Pocket, PocketService, PocketLog, PocketUtility, PocketQueryFilter, dbClient, execute,PocketRemoteRequest } = PocketLib;

/**
 * @summary Pocket TuruncTodayCurrency servisi.
 * @description Bu servisin ne yaptığını açıklayan kısa bir metin.
 * @param {Pocket} criteria - Servise gelen ve doğrulanacak parametreleri içeren nesne.
 * @returns {Promise<object>}
 */
const TuruncTodayCurrency = execute(async (criteria) => {
     try {
          const remoteResponse = await PocketRemoteRequest.execute("https://finans.truncgil.com/v3/today.json", "GET")

          return remoteResponse;

     } catch (error) {
          PocketLog.error(`TuruncTodayCurrency servisinde hata meydana geldi: ${error.message}`);
          throw new Error(error.message);
     }
});

export default TuruncTodayCurrency;