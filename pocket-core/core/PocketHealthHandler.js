import { PocketLib } from "../../Util/MainConstants.js";
const { dbClient, Pocket, PocketLog, PocketUtility } = PocketLib;

class PocketHealthHandler {
     constructor (appName) {
          this.appName = appName;
     }

     async logShutdown(eventType, details = {}) {
          const logEntry = {
               timestamp: new Date().toISOString(),
               loggerTimeStamp: PocketUtility.LoggerTimeStamp(),
               appName: this.appName,
               eventType,
               details,
          };

          try {
               const insertFirstDefination = await new Promise((resolve, reject) => {
                    dbClient.executeInsert({
                         from: "admin.apiHealth",
                         params: logEntry,
                         done: resolve,
                         fail: reject,
                    });
               });

               return insertFirstDefination;
          } catch (error) {
               console.error('Loglama hatası:', error);
          }
     }
     static startMonitoring(appName) {
          const handler = new PocketHealthHandler(appName);
          this.reset(appName)
          process.on('uncaughtException', async (err) => {
               PocketLog.error('Uncaught Exception:', err);
               await handler.logShutdown('Uncaught Exception', { message: err.message, stack: err.stack });
               process.exit(1);
          });

          process.on('unhandledRejection', async (reason) => {
               PocketLog.error('Yakalanmamış Promise Hatası:', reason);
               await handler.logShutdown('Unhandled Rejection', { reason });
               process.exit(1);
          });

          process.on('SIGINT', async () => {
               PocketLog.error('SIGINT signal received. The application is shutting down.', new Error());
               await handler.logShutdown('SIGINT', { message: 'Ctrl+C ile sonlandırıldı.' });
               process.exit(0);
          });

          process.on('SIGTERM', async () => {
               PocketLog.error('SIGTERM signal received. The application is shutting down.', err);
               await handler.logShutdown('SIGTERM', { message: 'Kill komutu ile sonlandırıldı.' });
               process.exit(0);
          });

          process.on('beforeExit', async (code) => {
               console.log('[beforeExit] Kapanmadan önce temizleniyor:', code);
               await handler.logShutdown('Before Exit', { message: 'İşlem bitiyor ama async işlemler olabilir.' });
          });

          process.on('exit', (code) => {
               console.log('[exit] Uygulama çıkıyor:', code);
          });

          process.on('warning', async (warning) => {
               await handler.logShutdown('Node Warning', {
                    name: warning.name,
                    message: warning.message,
                    stack: warning.stack,
               });
          });

          process.on('rejectionHandled', async (promise) => {
               await handler.logShutdown('Rejection Handled', { promise: String(promise) });
          });

          /*
          process.on('multipleResolves', async (type, promise, reason) => {
               await handler.logShutdown('Multiple Resolves', {
                    type, reason: String(reason),
               });
          });
          */

     }
     static async reset(appName) {
          let deleteFilter = new Pocket();
          deleteFilter.put("appName", appName)
          const deleteResponse = await new Promise((resolve, reject) => {
               dbClient.executeDelete({
                    from: "admin.apiHealth",
                    where: deleteFilter,
                    done: resolve,
                    fail: reject,
               });
          });
          return deleteResponse
     }
}

export default PocketHealthHandler;
