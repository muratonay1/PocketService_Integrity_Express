import PocketUtility from './PocketUtility.js';
import Pocket from './Pocket.js';
import config from '../pocket-config.json' assert { type: 'json' };
import fs from 'fs';
import path, { resolve } from 'path';
import PocketLog from './PocketLog.js';
export default class PocketConfigManager {

    /**
     * String first char uppercase
     * @param {String} string
     * @private
     */
    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    /**
     * get batch server info batch
     * @returns
     *
     */
    static startApplicationInfo() {
        return new Promise(function (resolve, reject) {
            let application;
            try {
                if (config.application != undefined) {
                    application = config.application;
                } else {
                    throw new Error("Invalid application");
                }
                let applicationPocket = new Pocket();
                for (const element of Object.keys(application)) {
                    applicationPocket.put(PocketConfigManager.capitalizeFirstLetter(element), application[element])
                }
                resolve(applicationPocket.toObject());
            } catch (error) {
                reject(new Error(`(error) startAppInfo: ${error.stack}`));
            }
        });
    }

    static async checkModules() {
        const rootFolder = './Modules';

        try {
            const modules = fs.readdirSync(rootFolder, { withFileTypes: true });
            let successCount = 0;
            let failCount = 0;
            let servicesCount = 0;
            for (const module of modules) {
                if (module.isDirectory()) {
                    const modulePath = path.join(rootFolder, module.name);
                    const servicesPath = path.join(modulePath, 'services');
                    const constantsPath = path.join(modulePath, 'constants.js');

                    if (fs.existsSync(servicesPath) && fs.existsSync(constantsPath)) {
                        const serviceFiles = fs.readdirSync(servicesPath);
                        console.log(`Module: ${module.name}`);
                        console.log(`Constants: ${constantsPath}`);
                        console.log('Services:');
                        for (const serviceFile of serviceFiles) {
                            try {
                                servicesCount++;
                                PocketLog.info(`- ${serviceFile} loading successfully`)
                                successCount++
                            } catch (error) {
                                PocketLog.error(`>>> (( ERROR LOADING ${serviceFile}))\nErrorDefination: `+error.message)
                                failCount++
                            }
                        }
                        console.log('\n\n--------------------------------------\n\n');
                        console.log('');

                    } else {
                        console.log(`Module ${module.name} does not have services or constants.js file.`);
                    }
                }
            }
            let message = "\n\nSuccess process: "+successCount+"\nFail process: "+failCount + "\nTotal Modules: "+modules.length + "\nTotal Service: "+servicesCount+"\n";
            console.log("\n")
            PocketLog.info(message);
            if(failCount != 0){
                throw new Error();
            }
            resolve();
        } catch (error) {
            console.error('Error while checking modules:', error);
            PocketLog.error("The server failed to start.",error);
            throw new Error();
        }
    }


    static getServicePath() {
        if (config.settings.servicePath != undefined || config.settings.servicePath != "") {
            return config.settings.servicePath;
        }
        throw new Error("Pocket Config file does not find servicepath.");

    }
    static getConfigPath() {
        if (config.settings.pocketConfigPath != undefined || config.settings.pocketConfigPath != "") {
            return config.settings.pocketConfigPath;
        }
        throw new Error("Pocket Config file does not find configPath parameter.");
    }
    static getServiceTimeout() {
        if (config.settings.serviceTimeout != undefined || config.settings.serviceTimeout != "") {
            return config.settings.serviceTimeout;
        }
        throw new Error("Pocket Config file does not find serviceTimeout parameter.");
    }
    static getEncryptKey() {
        if (config.settings.encryptKey != undefined || config.settings.encryptKey != "") {
            return config.settings.encryptKey;
        }
        throw new Error("Pocket Config file does not find encrypt key parameter.");
    }
    static getGatewayConfig() {
        if (config.gatewayConfig != undefined || config.gatewayConfig != "") {
            return config.gatewayConfig;
        }
        throw new Error("Pocket Config file does not find gateway config parameter.");
    }
    static getApiPort() {
        if (config.settings.apiPort != undefined || config.settings.apiPort != "") {
            return config.settings.apiPort;
        }
        throw new Error("Pocket Config file does not find settings config api port parameter.");
    }
    static getSocketPort() {
        if (config.settings.socketPort != undefined || config.settings.socketPort != "") {
            return config.settings.socketPort;
        }
        throw new Error("Pocket Config file does not find settings config api port parameter.");
    }
    static getMailExpiredSecond() {
        if (config.settings.mailExpiredSecond != undefined || config.settings.mailExpiredSecond != "") {
            return config.settings.mailExpiredSecond;
        }
        throw new Error("Pocket Config file does not find settings config mail expired second parameter.");
    }
    static getTokenExpiredSecond() {
        if (config.settings.tokenExpiredSecond != undefined || config.settings.tokenExpiredSecond != "") {
            return config.settings.tokenExpiredSecond;
        }
        throw new Error("Pocket Config file does not find settings config token expired second parameter.");
    }
    static getApiRateOptions() {
        if (
            (config.settings.apiRateOptions.windowMs != undefined && config.settings.apiRateOptions.max != undefined) ||
            (config.settings.apiRateOptions.windowMs != "" && config.settings.apiRateOptions.max != "" &&
                PocketUtility.isNumber(config.settings.apiRateOptions.windowMs) && PocketUtility.isNumber(config.settings.apiRateOptions.max))) {
            return config.settings.apiRateOptions;
        }
        throw new Error("Pocket Config file does not find settings config api ip rate limit parameter.");
    }
    static getServiceType() {
        if (config.settings.serviceType != undefined || config.settings.serviceType != "") {
            return config.settings.serviceType;
        }
        throw new Error("Pocket Config file does not find settings config service type parameter.");
    }
    static getApiList() {
        if (config.gatewayConfig != undefined || config.gatewayConfig != "") {
            let gatewayConfig = config.gatewayConfig;
            let apiObjectList = [];
            Object.keys(gatewayConfig).forEach(moduleName => {
                Object.keys(gatewayConfig[moduleName]).forEach(serviceName => {
                    const endPoint = gatewayConfig[moduleName][serviceName].endPoint;
                    const method = gatewayConfig[moduleName][serviceName].method
                    const apiObject = {
                        module: moduleName,
                        service: serviceName,
                        endPoint: endPoint,
                        method:method
                    };
                    apiObjectList.push(apiObject);
                });
            });
            return apiObjectList;
        }
        throw new Error("Pocket Config file does not find gateway config parameter.");
    }
    static getApiInformation(endPointName) {
        if (config.gatewayConfig != undefined || config.gatewayConfig != "") {
            let gatewayConfig = config.gatewayConfig;
            for (const moduleKey of Object.keys(gatewayConfig)) {
                const moduleConfig = gatewayConfig[moduleKey];
                for (const serviceKey of Object.keys(moduleConfig)) {
                    const serviceConfig = moduleConfig[serviceKey];
                    if (serviceConfig.endPoint === endPointName) {
                        return {
                            module: moduleKey,
                            service: serviceKey,
                            endPoint: endPointName
                        };
                    }
                }
            }
            return null; // Eğer endPointName ile eşleşen bir servis bulunamazsa null döner
        }
        throw new Error("Pocket Config file does not find gateway config parameter.");

    }
    static getMongoConfig() {
        if (config.connection.mongo.uri != undefined || config.connection.mongo.uri != "") {
            return config.connection.mongo.uri;
        }
        throw new Error("Pocket Config file does not find mongo connection uri parameter.");
    }
    /**
     *
     * @param {String} connection {"mongo","sql","oracle","firebase"} connection get uri info
     * @returns {Object}
     */
    connectionStat(connection) {
        if (config.connection[connection] != undefined) return config.connection[connection]
        else throw new Error("Invalid connection name").stack
    }
}