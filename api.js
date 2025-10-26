import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Modules, ERROR_MESSAGE, PocketLib, GeneralKeys } from "./Util/MainConstants.js";
import PocketHealthHandler from './pocket-core/core/PocketHealthHandler.js';
import dotenv from 'dotenv';
import {saveApiLog, logApiRequest, logApiError} from './Util/ApiLog.js';
import {handleRateLimitError, middleWare, apiRateLimit} from './Util/Middlewares.js';
import {checkApiAbuseAtacker,checkApiUserLimitToken} from './Util/ApiController.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
var abuseEnabled = process.env.ABUSE_ENABLED != "false";
const {

     Pocket,
     PocketConfigManager,
     PocketService,
     PocketUtility,
     PocketLog

} = PocketLib;


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

PocketConfigManager.checkModules()
     .then(result => {
          PocketLog.info("\nModule and service static check has been completed successfully.\n");
          const app = express();
          app.use(cors());
          app.use(bodyParser.json());
          app.use('/site', express.static(path.join(__dirname, 'pocket-core', 'ui')));
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
               const serviceResponse = await PocketService.executeService("SaveServerInfo", "pocket-core", Pocket.create());
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
