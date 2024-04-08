import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Modules, ERROR_MESSAGE, PocketLib, GeneralKeys } from "./Util/MainConstants.js";
const {

     Pocket,
     PocketConfigManager,
     PocketService,
     PocketUtility,
     PocketLog

} = PocketLib;

// API Rate Limit Options
const apiRateLimit = rateLimit(
     {
          windowMs: 60 * 1000, // milliseconds - how long to keep records of requests in memory
          max: 5, // max number of recent connections during `window` milliseconds before sending a 429 response
          message: "Too many requests, please try again later.",
          statusCode: 429, // 429 status = Too Many Requests (RFC 6585)
          headers: true, //Send custom rate limit header with limit and remaining
          // allows to create custom keys (by default user IP is used)
          keyGenerator: function (req /*, res*/) {
               return req.ip;
          },
          handler: await handleRateLimitError,
     }
);

// API Request Logger
async function logApiRequest(req, apiInformation) {
     let logPocket = Pocket.create();
     logPocket.put(GeneralKeys.END_POINT, apiInformation.endPoint);
     logPocket.put(GeneralKeys.HOST, req.headers.host);
     logPocket.put(GeneralKeys.CREATED_REQUEST_TIME, PocketUtility.LoggerTimeStamp());
     logPocket.put(GeneralKeys.PARAMS, Object.fromEntries(new URL(req.url, `http://${req.headers.host}`).searchParams));
     return await PocketService.executeService("SaveApiLog", Modules.ADMIN, logPocket);
}

// Error Logger
async function logApiError(req, apiInformation, error) {
     let logPocket = Pocket.create();
     logPocket.put(GeneralKeys.END_POINT, apiInformation.endPoint);
     logPocket.put(GeneralKeys.HOST, req.headers.host);
     logPocket.put(GeneralKeys.CREATED_REQUEST_TIME, PocketUtility.LoggerTimeStamp());
     logPocket.put(GeneralKeys.PARAMS, Object.fromEntries(new URL(req.url, `http://${req.headers.host}`).searchParams));
     logPocket.put(GeneralKeys.ERROR, { message: error.message, stack: error.stack });
     return await PocketService.executeService("SaveApiLog", Modules.ADMIN, logPocket);
}

async function handleApiRequest(req, res, apiInformation) {
     try {
          let paramsObject = {};

          // Query parametreleri
          const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
          const queryParams = Object.fromEntries(parsedUrl.searchParams);
          Object.assign(paramsObject, queryParams);

          // Header bilgileri
          const headers = req.headers;
          // Örneğin, x-user-token header'ını paramsObject içine ekleyin
          if (headers['x-user-token']) {
               paramsObject['x-user-token'] = headers['x-user-token'];
          }

          // POST isteği ile gönderilen body
          if (req.method === 'POST') {
               // req.body içindeki verileri paramsObject'e ekleyin
               Object.assign(paramsObject, req.body);
          }

          // nginx için
          paramsObject["ip"] = req.realIp = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

          // Servisi çalıştırın ve sonucu döndürün
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
          if (req.headers[GeneralKeys.X_USER_TOKEN] != undefined) {
               let permissionPocket = Pocket.create();
               permissionPocket.put("permissionToken", req.headers[GeneralKeys.X_USER_TOKEN]);
               const result = await PocketService.executeService("ControlUserPermissionToken", Modules.ADMIN, permissionPocket);
               if (!result.data) {
                    throw new Error("Token hatası");
               }
               return true;
          }
          throw new Error(ERROR_MESSAGE.API_TOKEN_NOT_FOUND);

     } catch (error) {
          res.status(500).json({ error: error.message });
     }
}

// API Log Save Handler
async function saveApiLog(req) {

     try {
          let logPocket = Pocket.create();
          logPocket.put(GeneralKeys.END_POINT, req.url);
          logPocket.put(GeneralKeys.HOST, req.headers.host);
          logPocket.put(GeneralKeys.CREATED_REQUEST_TIME, PocketUtility.LoggerTimeStamp());
          logPocket.put(GeneralKeys.PARAMS, req.headers);
          logPocket.put(GeneralKeys.ERROR, { error: "Unauthorized Request" });
          await PocketService.executeService("SaveApiLog", Modules.ADMIN, logPocket);
     } catch (error) {
          PocketLog.error("Save api log function failed.", error);
          throw new Error(error);
     }
}

// Middleware Buffer
async function middleWare(req, res, next) {
     const userToken = req.headers[GeneralKeys.X_USER_TOKEN]; // Kullanıcı tokeni başlıkta mı kontrolü?
     PocketLog.info("Request user token -> " + userToken);
     if (!userToken) {
          await saveApiLog(req);
          return res.status(401).send({ error: ERROR_MESSAGE.EMPTY_TOKEN });
     }
     await saveApiLog(req);
     return true;
}

// API sınır aşımı hatası middleware'i
async function handleRateLimitError(err, req, res, next, legacyInfo) {
     const clientIP = req.connection.remoteAddress;
     PocketLog.warn(`Too many requests from IP: ${clientIP}.`);

     let requestInfo = Pocket.create();
     requestInfo.put("from", err.headers);
     requestInfo.put("ip", clientIP);
     requestInfo.put("path", err.path);
     requestInfo.put("insertDate", PocketUtility.GetRealDate());
     requestInfo.put("insertTime", PocketUtility.GetRealTime());
     requestInfo.put("fullDate", PocketUtility.LoggerTimeStamp());
     requestInfo.put("path", err.path);
     requestInfo.put("rateInfo", err.rateLimit);

     let entriesObject = [];
     for (let entry of next.store.current.entries()) {
          let key = entry[0];
          let value = entry[1];
          entriesObject.push({
               [key]: value
          })
     }

     requestInfo.put("store", entriesObject);

     const suspectData = await PocketService.executeService("DecisionRepetiteAttackRequest", Modules.ADMIN, requestInfo);
     if (suspectData.data.isRisked) {
          //Şüpheli işlem mail bildirimi
          await PocketService.executeService(`ITReportSender`, Modules.NOTIFICATION, requestInfo);
     }

     req.status(429).json({ error: ERROR_MESSAGE.API_RATE_LIMIT_ERROR });
}


PocketConfigManager.checkModules()
     .then(result => {
          PocketLog.info("\nModule and service static check has been completed successfully.\n");
          // Define express
          const app = express();
          // Define cors conf.
          app.use(cors());
          app.use(bodyParser.json());
          const port = PocketConfigManager.getApiPort();
          PocketConfigManager.getApiList().forEach(apiInformation => {
               if (apiInformation.method === 'GET') {
                    app.get('/api/' + apiInformation.endPoint, async (req, res) => {
                         const checker = await checkApiUserLimitToken(req, res);
                         if (checker) {
                              await handleApiRequest(req, res, apiInformation);
                         }
                    });
               } else if (apiInformation.method === 'POST') {
                    app.post('/api/' + apiInformation.endPoint, async (req, res) => {
                         const checker = await checkApiUserLimitToken(req, res);
                         if (checker) {
                              await handleApiRequest(req, res, apiInformation);
                         }
                    });
               }
          });
          // Define api request limitter
          app.use(apiRateLimit);
          app.use(handleRateLimitError);
          app.use(middleWare);

          app.listen(port, async () => {
               const serviceResponse = await PocketService.executeService("SaveServerInfo", Modules.ADMIN, Pocket.create());
               if (serviceResponse) {
                    PocketLog.info(`Server is started on port ${port}`);
               } else {
                    throw new Error(ERROR_MESSAGE.SERVER_RUN_ERROR);
               }
          });
     })
     .catch(error => {
          PocketLog.error('Error:', error.message);
     });
