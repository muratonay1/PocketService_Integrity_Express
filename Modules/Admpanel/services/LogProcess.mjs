import { PocketLib } from "../constants.js";
const { PocketLog, execute } = PocketLib;

import fs from 'fs';
import path from 'path';

const LogProcess = execute(async () => {
     try {
          // Statik tarih: Bu tarihten önceki loglar silinecek
          const staticDate = "2024-11-29 12:04:00";

          // Tarih formatını doğrula ve `Date` nesnesine dönüştür
          const validateAndParseDate = (dateString) => {
               const dateFormatRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
               if (!dateFormatRegex.test(dateString)) {
                    throw new Error(`Geçersiz tarih formatı: ${dateString}. Format "YYYY-MM-DD HH:mm:ss" olmalıdır.`);
               }

               const [year, month, day, hour, minute, second] = dateString
                    .replace(/[- :]/g, ',')
                    .split(',')
                    .map(Number);
               return new Date(year, month - 1, day, hour, minute, second); // Aylar 0 tabanlıdır
          };

          // Statik tarihi `Date` nesnesine çevir
          const retentionDate = validateAndParseDate(staticDate);
          PocketLog.info(`Log dosyasından ${staticDate} tarihinden önceki kayıtlar silinecek.`);

          // Log dosyası yolu
          const logFilePath = path.join(process.cwd(), 'test.log');

          // Log dosyasını oku
          const logData = await fs.promises.readFile(logFilePath, 'utf8');

          // Logları ayır ve boş satırları temizle
          const logs = logData
               .split(/\r?\n/) // Hem `\n` hem de `\r\n` karakterlerini destekle
               .filter((log) => log.trim().length > 0); // Boş satırları kaldır

          const logTypeRegex = /^\[(INFO|REQUEST|ERROR|WARNING)\]/; // Log tiplerini tespit et
          const dateRegex = /\[([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2})/;

          const updatedLogs = [];
          let skipBlock = false; // Bir blok silinmeye başlandı mı?

          for (let i = 0; i < logs.length; i++) {
               const log = logs[i];
               const dateMatch = log.match(dateRegex);
               const logDate = dateMatch ? new Date(dateMatch[1]) : null;

               // Blok başlangıcını belirle
               if (logTypeRegex.test(log)) {
                    skipBlock = logDate && logDate < retentionDate; // Tarih retentionDate'den önceyse sil
               }

               // Eğer blok silinmiyorsa log'u ekle
               if (!skipBlock) {
                    updatedLogs.push(log);
               }
          }

          // Eğer kayıt bulunamazsa mesaj ver
          if (updatedLogs.length === 0) {
               PocketLog.info('Kayıt bulunamadı. Tüm loglar kriterlere göre silindi.');
               return { message: 'Kayıt bulunamadı. Tüm loglar kriterlere göre silindi.' };
          }

          // Güncellenmiş logları dosyaya yaz
          await fs.promises.writeFile(logFilePath, updatedLogs.join('\n'), 'utf8');

          PocketLog.info(`Log dosyasından ${logs.length - updatedLogs.length} kayıt silindi.`);
          return { removedLogs: logs.length - updatedLogs.length };
     } catch (error) {
          PocketLog.error(`LogProcess servisinde hata meydana geldi: ${error.message}`);
          throw new Error(error.message);
     }
});

export default LogProcess;
