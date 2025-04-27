import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Modules, ERROR_MESSAGE, PocketLib, GeneralKeys } from "./Util/MainConstants.js";
import PocketHealthHandler from './pocket-core/PocketHealthHandler.js';
import dotenv from 'dotenv';
dotenv.config();
var abuseEnabled = process.env.ABUSE_ENABLED === 'true';
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
          windowMs: 60 * 1000,
          max: 5,
          message: "Too many requests, please try again later.",
          statusCode: 429,
          headers: true,
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

          const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
          const queryParams = Object.fromEntries(parsedUrl.searchParams);
          Object.assign(paramsObject, queryParams);

          const headers = req.headers;

          if (headers['x-user-token']) {
               paramsObject['x-user-token'] = headers['x-user-token'];
          }

          if (req.method === 'POST') {

               Object.assign(paramsObject, req.body);
          }

          // nginx
          paramsObject["ip"] = req.realIp = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

          const result = await PocketService.executeService(apiInformation.service, apiInformation.module, PocketUtility.ConvertToPocket(paramsObject));
          await logApiRequest(req, apiInformation);
          if(apiInformation.type == "html"){
               res.send(result.data)
          }
          else res.json(result);

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
               //await PocketService.executeService("CheckTokenEndpointAuth", Modules.ADMIN)
               const result = await PocketService.executeService("ControlUserPermissionToken", Modules.ADMIN, permissionPocket);
               if (!result.data) {
                    throw new Error("Token hatası");
               }
               return true;
          }
          throw new Error(ERROR_MESSAGE.API_TOKEN_NOT_FOUND);

     } catch (error) {
          let response = {
               "error":error.message,
               "x-user-token":req.headers[GeneralKeys.X_USER_TOKEN],
               "request_url":req.url
          }
          await saveApiLog(req,response)
          res.status(500).json({ error: error.message });
     }
}

// API Log Save Handler
async function saveApiLog(req,response) {

     try {
          let ip = req.realIp = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
          let logPocket = Pocket.create();
          logPocket.put(GeneralKeys.END_POINT, req.url);
          logPocket.put(GeneralKeys.HOST, req.headers.host);
          logPocket.put("ip",ip);
          logPocket.put(GeneralKeys.CREATED_REQUEST_TIME, PocketUtility.LoggerTimeStamp());
          logPocket.put(GeneralKeys.PARAMS, req.headers);
          logPocket.put(GeneralKeys.ERROR, response);
          await PocketService.executeService("SaveApiLog", Modules.ADMIN, logPocket);
     } catch (error) {
          PocketLog.error("Save api log function failed.", error);
          throw new Error(error);
     }
}

// Middleware Buffer
async function middleWare(req, res, next) {
     const userToken = req.headers[GeneralKeys.X_USER_TOKEN];
     PocketLog.info("Request user token -> " + userToken);
     if (PocketConfigManager.getApiInformation(req.url) == null) {
          let response = {
               "status": 404,
               "error": "Not Found",
               "message": "The requested URL was not found on the server.",
               "path": "/invalid-url"
          };
          await saveApiLog(req,response);
          return res.status(401).send(response);
     };
     if (!userToken) {
          let response = {
               "error":ERROR_MESSAGE.EMPTY_TOKEN,
               "x-user-token":userToken
          }
          await saveApiLog(req,response);
          return res.status(401).send(response);
     }
     let response = {
          "x-user-token":userToken
     }
     await saveApiLog(req,response);
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

async function checkApiAbuseAtacker(req, res, apiInformation) {
     try {
          let crt = Pocket.create();
          let remoteIp = req.realIp = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
          crt.put("ip", remoteIp);
          const serviceResponse = await PocketService.executeService(`CheckAbuseipAttacker`, `Admin`, crt);
          if (serviceResponse.data.status == "high-risk" || serviceResponse.data.status == "medium-risk" || serviceResponse.data.status == "low-risk") {
               throw new Error(serviceResponse.data.message)
          }
          return true;
     } catch (error) {
          await logApiError(req, apiInformation, error);
          throw error;
     }
}



PocketConfigManager.checkModules()
     .then(result => {
          PocketLog.info("\nModule and service static check has been completed successfully.\n");
          const app = express();
          app.use(cors());
          app.use(bodyParser.json());
          const port = PocketConfigManager.getApiPort();
          PocketConfigManager.getApiList().forEach(apiInformation => {
               if (apiInformation.method === 'GET') {
                    app.get('/api/' + apiInformation.endPoint, async (req, res) => {
                         try {
                              let remoteIp = req.realIp = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                              PocketLog.request(`
                                   [MODULE]       : ${apiInformation.module}
                                   [SERVICE]      : ${apiInformation.service}
                                   [ENDPOINT]     : ${apiInformation.endPoint}
                                   [METHOD]       : ${apiInformation.method}
                                   [X-USER-TOKEN] : ${req.headers[GeneralKeys.X_USER_TOKEN] || null}
                                   [IP]           : ${remoteIp}
                               `);

                              if (abuseEnabled) {
                                   await checkApiAbuseAtacker(req, res, apiInformation);
                              }
                              const checker = apiInformation.type != "html" ? await checkApiUserLimitToken(req, res) : true
                              if (checker) {
                                   await handleApiRequest(req, res, apiInformation);
                              }
                         } catch (error) {
                              res.status(500).json({ error: error.message });
                         }
                    });

               } else if (apiInformation.method === 'POST') {
                    app.post('/api/' + apiInformation.endPoint, async (req, res) => {
                         try {
                              let remoteIp = req.realIp = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                              PocketLog.request(`
                                   [MODULE]       : ${apiInformation.module}
                                   [SERVICE]      : ${apiInformation.service}
                                   [ENDPOINT]     : ${apiInformation.endPoint}
                                   [METHOD]       : ${apiInformation.method}
                                   [X-USER-TOKEN] : ${req.headers[GeneralKeys.X_USER_TOKEN] || null}
                                   [IP]           : ${remoteIp}
                               `);
                              if (abuseEnabled) {
                                   PocketLog.info("AbuseEnabled")
                                   await checkApiAbuseAtacker(req, res, apiInformation);
                              } else PocketLog.info("AbuseDisabled")
                              const checker = apiInformation.type != "html" ? await checkApiUserLimitToken(req, res) : true
                              if (checker) {
                                   await handleApiRequest(req, res, apiInformation);
                              }
                         } catch (error) {
                              res.status(500).json({ error: error.message });
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
                    console.log("\n");
                    PocketLog.info(`Server is started on port ${port}`);
                    await PocketHealthHandler.startMonitoring('api');
               } else {
                    throw new Error(ERROR_MESSAGE.SERVER_RUN_ERROR);
               }
          });
     })
     .catch(error => {
          PocketLog.error('Error:', error.message);
     });

