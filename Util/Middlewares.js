import { PocketLib } from "./MainConstants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;
import { saveApiLog } from './ApiLog.js';
import rateLimit from 'express-rate-limit';

export async function handleRateLimitError(err, req, res, next, legacyInfo) {
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

     const suspectData = await PocketService.executeService("DecisionRepetiteAttackRequest", "pocket-core", requestInfo);
     if (suspectData.data.isRisked) {
          //Şüpheli işlem mail bildirimi
          await PocketService.executeService(`ITReportSender`, Modules.NOTIFICATION, requestInfo);
     }

     req.status(429).json({ error: ERROR_MESSAGE.API_RATE_LIMIT_ERROR });
}

// Middleware Buffer
export async function middleWare(req, res, next) {
     const userToken = req.headers["x-user-token"];
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

// API Rate Limit Options
export const apiRateLimit = rateLimit(
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