import { PocketLib } from "../constants.js";
const {
     Pocket,
     PocketQueryFilter,
     PocketService,
     execute,
     PocketLog,
     dbClient

} = PocketLib;

/**
 * Pocket servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>} Hesap arama sonuçları
 */
const Test = execute(async (criteria) => {
     try {
          let filter = new PocketQueryFilter();
          filter.add("title", "The Land Beyond the Sunset").operator("==");

          const searchResult = await new Promise((resolve, reject) => {
               dbClient.executeGet({
                    from: "netflix.movies",
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          if (searchResult.length === 0) {
               PocketLog.error("No search result : Kullanıcı bulunamadı");
               throw new Error("Kullanıcı bulunamadı.");
          }
          return searchResult[0];
     } catch (error) {
          PocketLog.error(`Test servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default Test;