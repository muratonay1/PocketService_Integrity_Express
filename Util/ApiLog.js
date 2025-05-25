import PocketService from '../pocket-core/core/PocketService.js';
import PocketUtility from '../pocket-core/core/PocketUtility.js';
import Pocket from '../pocket-core/core/Pocket.js';

// Success Logger
export async function logApiRequest(req, apiInformation) {
     let logPocket = Pocket.create();
     logPocket.put("endPoint", apiInformation.endPoint);
     logPocket.put("host", req.headers.host);
     logPocket.put("createdRequestTime", PocketUtility.LoggerTimeStamp());
     logPocket.put("params", Object.fromEntries(new URL(req.url, `http://${req.headers.host}`).searchParams));
     return await PocketService.executeService("SaveApiLog", "pocket-core", logPocket);
}

// Error Logger
export async function logApiError(req, apiInformation, error) {
     let logPocket = Pocket.create();
     logPocket.put("endPoint", apiInformation.endPoint);
     logPocket.put("host", req.headers.host);
     logPocket.put("createdRequestTime", PocketUtility.LoggerTimeStamp());
     logPocket.put("params", Object.fromEntries(new URL(req.url, `http://${req.headers.host}`).searchParams));
     logPocket.put("error", { message: error.message, stack: error.stack });
     return await PocketService.executeService("SaveApiLog", "pocket-core", logPocket);
}

// API Log Save Handler
export async function saveApiLog(req,response) {

     try {
          let ip = req.realIp = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
          let logPocket = Pocket.create();
          logPocket.put("endPoint", req.url);
          logPocket.put("host", req.headers.host);
          logPocket.put("ip",ip);
          logPocket.put("createdRequestTime", PocketUtility.LoggerTimeStamp());
          logPocket.put("params", req.headers);
          logPocket.put("error", response);
          await PocketService.executeService("SaveApiLog", "pocket-core", logPocket);
     } catch (error) {
          PocketLog.error("Save api log function failed.", error);
          throw new Error(error);
     }
}

// Request Service Logger
export async function saveServiceLog(log) {
     try {
          let saveServiceLog = Pocket.create();
          if (log.params != undefined) saveServiceLog.put("params", log.params);
          saveServiceLog.put("response", log.response);
          saveServiceLog.put("service", log.service);
          saveServiceLog.put("module", log.module);
          saveServiceLog.put("source", log.source)
          saveServiceLog.put("insertDate", log.insertDate);

          const insertResult = await new Promise((resolve, reject) => {
               dbClient.executeInsert({
                    from: "pocket.service",
                    params: saveServiceLog,
                    done: resolve,
                    fail: reject
               });
          });
          return insertResult;
     }
     catch (error) {
          PocketLog.error("ApiLog: saveServiceLog metodu hata aldı.");
          throw new Error(error);
     }
}