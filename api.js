import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import PocketUtility from './pocket-core/PocketUtility.js';
import Pocket from './pocket-core/Pocket.js';
import PocketService from './pocket-core/PocketService.js';
import PocketConfigManager from './pocket-core/PocketConfigManager.js';
import PocketLog from './pocket-core/PocketLog.js';

// API Request Logger
async function logApiRequest(req, apiInformation) {
     let logPocket = Pocket.create();
     logPocket.put("endPoint", apiInformation.endPoint);
     logPocket.put("host", req.headers.host);
     logPocket.put("createdRequestTime", PocketUtility.LoggerTimeStamp());
     logPocket.put("params", Object.fromEntries(new URL(req.url, `http://${req.headers.host}`).searchParams));
     return await PocketService.executeService("SaveApiLog", "Admin", logPocket);
}

// Error Logger
async function logApiError(req, apiInformation, error) {
     let logPocket = Pocket.create();
     logPocket.put("endPoint", apiInformation.endPoint);
     logPocket.put("host", req.headers.host);
     logPocket.put("createdRequestTime", PocketUtility.LoggerTimeStamp());
     logPocket.put("params", Object.fromEntries(new URL(req.url, `http://${req.headers.host}`).searchParams));
     logPocket.put("error", { message: error.message, stack: error.stack });
     return await PocketService.executeService("SaveApiLog", "Admin", logPocket);
}

// API Handler
async function handleApiRequest(req, res, apiInformation) {
     try {
          const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
          const paramsObject = Object.fromEntries(parsedUrl.searchParams);
          const result = await PocketService.executeService(apiInformation.service, apiInformation.module, PocketUtility.ConvertToPocket(paramsObject));
          await logApiRequest(req, apiInformation);
          res.json(result);
     } catch (error) {
          await logApiError(req, apiInformation, error);
          res.status(500).json({ error: error.message });
     }
}


// API Handler
async function checkApiUserLimitToken(req, res) {
     try {
          if (req.headers['x-user-token'] != undefined) {
               let permissionPocket = Pocket.create();
               permissionPocket.put("permissionToken", req.headers['x-user-token']);
               const result = await PocketService.executeService("ControlUserPermissionToken", "Admin", permissionPocket);
               if (!result.data) {
                    throw new Error("Token hatası");
               }
               return true;
          }
          throw new Error("Api token is not undefined.");

     } catch (error) {
          res.status(500).json({ error: error.message });
     }
}

PocketConfigManager.checkModules()
     .then(result => {
          PocketLog.info("\nModule and service static check has been completed successfully.\n");
          // Define express
          const app = express();
          // Define cors conf.
          app.use(cors());
          const port = PocketConfigManager.getApiPort();
          PocketConfigManager.getApiList().forEach(apiInformation => {
               app.get('/' + apiInformation.endPoint, async (req, res) => {
                    const checker = await checkApiUserLimitToken(req, res);
                    if (checker) {
                         await handleApiRequest(req, res, apiInformation);
                    }
               });
          });
          // Define api request limitter
          app.use(rateLimit(PocketConfigManager.getApiRateOptions()));
          // Define api without permission request detection
          app.use(async function (req, res, next) {
               const userToken = req.headers['x-user-token']; // Kullanıcı tokeni başlıkta
               console.log(userToken);
               if (!userToken) {
                    return res.status(401).json({ error: 'User token is required' });
               }
               let logPocket = Pocket.create();
               logPocket.put("endPoint", req.url);
               logPocket.put("host", req.headers.host);
               logPocket.put("createdRequestTime", PocketUtility.LoggerTimeStamp());
               logPocket.put("parameter", req.headers);
               logPocket.put("error", { error: "Unauthorized" });
               await PocketService.executeService("SaveApiLog", "Admin", logPocket);
               res.status(404).send({ error: "Unauthorized" });
          });
          app.listen(port, async () => {
               const serviceResponse = await PocketService.executeService("SaveServerInfo", "Admin", Pocket.create());
               if (serviceResponse) {
                    PocketLog.info(`Server is started on port ${port}`);
               } else {
                    throw new Error("Sunucu başlatılamadı: Beklenmeyen bir hata oluştu ve sunucu başlatılamadı. Lütfen daha sonra tekrar deneyin veya sistem yöneticinizle iletişime geçin.");
               }
          });
     })
     .catch(error => {
          PocketLog.error('Error:', error.message);
     });
