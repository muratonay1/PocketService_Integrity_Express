import { Modules, PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, executeBatch, dbClient, Pocket } = PocketLib;
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Pocket CeyrekAltinBatch servisi
 * @param {Pocket} criteria
 * @returns {Promise<String>} Satış fiyatı
 */
const CeyrekAltinBatch = executeBatch(async (criteria) => {
     PocketLog.info("CeyrekAltin servisine girildi.")
     const url = 'https://bigpara.hurriyet.com.tr/altin/ceyrek-altin-fiyati/';
     try {
          const { data } = await axios.get(url);
          const $ = cheerio.load(data);
          const pageTitle = $('h1').text().trim();
          const satısTL = $('.kurDetail .kurBox').toArray().find((element) => {
               const label = $(element).find('.text').text().trim();
               const value = $(element).find('.value').text().trim();

               return label === 'SATIŞ(TL)' && value !== '';
          });
          if (satısTL) {
               const value = $(satısTL).find('.value').text().trim();
               var searchCurrencyCriteria = Pocket.create();
               searchCurrencyCriteria.put("currency_name", "ceyrek_altin");
               const getResponse = await PocketService.executeService(`GetCurrencyWithName`, Modules.SCRAPPER, searchCurrencyCriteria);
               if (getResponse.data.amount != value) {
                    var updateCurrencyPocket = Pocket.create();
                    updateCurrencyPocket.put("currency_name", "ceyrek_altin");
                    updateCurrencyPocket.put("amount", value);
                    const updateResponse = await PocketService.executeService(`UpdateCurrency`, Modules.SCRAPPER, updateCurrencyPocket);
                    if (updateResponse) {
                         PocketLog.info("Ceyrek altin kaydi güncellendi.");
                         PocketLog.info("Eski Deger: " + getResponse.data.amount);
                         PocketLog.info("Yeni Deger: " + value);
                    }
               }
               else {
                    PocketLog.info("Ceyrek altin fiyati ayni. Güncelleme yapilmadi.");
               }
          } else {
               PocketLog.info("Ceyrek altin batchinde hata meydana geldi.");
               throw new Error('SATIŞ(TL) değeri bulunamadı.');
          }

     } catch (error) {
          PocketLog.error(`CeyrekAltinBatch servisinde hata meydana geldi: ` + error);
          throw new Error(error);
     }
});

export default CeyrekAltinBatch;
