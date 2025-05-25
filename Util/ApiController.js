import { PocketLib } from "./MainConstants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket, ERROR_MESSAGE } = PocketLib;
import { logApiError,saveApiLog } from './ApiLog.js';
import rateLimit from 'express-rate-limit';

export async function checkApiAbuseAtacker(req, res, apiInformation) {
     try {
          let crt = Pocket.create();
          let remoteIp = req.realIp = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
          crt.put("ip", remoteIp);
          const serviceResponse = await PocketService.executeService(`CheckAbuseipAttacker`, `pocket-core`, crt);
          if (serviceResponse.data.status == "high-risk" || serviceResponse.data.status == "medium-risk" || serviceResponse.data.status == "low-risk") {
               throw new Error(serviceResponse.data.message)
          }
          return true;
     } catch (error) {
          await logApiError(req, apiInformation, error);
          throw error;
     }
}

export async function checkApiUserLimitToken(req, res) {
     try {
          if (req.headers["x-user-token"] != undefined) {
               let permissionPocket = Pocket.create();
               permissionPocket.put("permissionToken", req.headers["x-user-token"]);
               //await PocketService.executeService("CheckTokenEndpointAuth", Modules.ADMIN)
               const result = await PocketService.executeService("ControlUserPermissionToken", "pocket-core", permissionPocket);
               if (!result.data) {
                    throw new Error("Token hatası");
               }
               return true;
          }
          throw new Error(ERROR_MESSAGE.API_TOKEN_NOT_FOUND);

     } catch (error) {
          let response = {
               "error":error.message,
               "x-user-token":req.headers["x-user-token"],
               "request_url":req.url
          }
          await saveApiLog(req,response)
          res.status(500).json({ error: error.message });
     }
}