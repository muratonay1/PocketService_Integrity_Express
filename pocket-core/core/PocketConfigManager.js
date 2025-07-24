import PocketUtility from './PocketUtility.js';
import Pocket from './Pocket.js';
import config from '../../pocket-config.json' assert { type: 'json' };
import fs from 'fs';
import path, { resolve } from 'path';
import { ESLint } from "eslint";
import PocketLog from './PocketLog.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
dotenv.config();
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
        const eslint = new ESLint();

        try {
            const modules = fs.readdirSync(rootFolder, { withFileTypes: true });
            let successCount = 0;
            let failCount = 0;
            let servicesCount = 0;
            const failedServices = [];

            PocketLog.info("\n📦 Starting ESLint and syntax check on all modules...\n");

            for (const module of modules) {
                if (!module.isDirectory()) continue;

                const modulePath = path.join(rootFolder, module.name);
                const servicesPath = path.join(modulePath, 'services');
                const constantsPath = path.join(modulePath, 'constants.js');

                if (!fs.existsSync(servicesPath) || !fs.existsSync(constantsPath)) {
                    PocketLog.warn(`⚠️  Module ${module.name} skipped (missing services or constants.js)`);
                    continue;
                }

                PocketLog.info(`\n🧩 Module: ${module.name}`);
                PocketLog.info(`📄 Constants: ${constantsPath}`);
                PocketLog.info(`🛠️  Services:`);

                const serviceFiles = fs.readdirSync(servicesPath);

                for (const serviceFile of serviceFiles) {
                    const serviceFilePath = path.join(servicesPath, serviceFile);
                    servicesCount++;

                    try {
                        // Sadece .mjs dosyalarında node --check çalıştır
                        if (serviceFilePath.endsWith('.mjs')) {
                            execSync(`node --check "${serviceFilePath}"`, { stdio: 'pipe' });
                        }

                        // ESLint kontrolü her dosya için
                        const results = await eslint.lintFiles([serviceFilePath]);

                        const ignoredRules = ["no-unused-vars", "no-console"];
                        const realMessages = results.flatMap(r =>
                            r.messages.filter(m => {
                                if (!m.ruleId) return true;
                                if (ignoredRules.includes(m.ruleId)) return false;
                                if (m.message.includes("'process'")) return false;
                                return true;
                            })
                        );

                        if (realMessages.length > 0) {
                            const formatter = await eslint.loadFormatter("stylish");
                            const resultText = formatter.format(results);
                            failedServices.push(serviceFile);
                            failCount++;
                            PocketLog.warn(`❌ ${serviceFile} has lint issues:\n${resultText}`);
                        } else {
                            successCount++;
                            PocketLog.info(`✅ ${serviceFile} passed linting`);
                        }
                    } catch (error) {
                        failCount++;
                        failedServices.push(serviceFile);
                        PocketLog.error(`🚨 Error in ${serviceFile}:\n${error.stderr?.toString() || error.message}`);
                    }
                }

                PocketLog.info('\n' + '-'.repeat(80) + '\n');
            }

            // Özet rapor
            const summary = `
================== ✅ LINT & SYNTAX SUMMARY ✅ ==================
✔ Success: ${successCount}
❌ Fail:    ${failCount}
📦 Modules Checked: ${modules.length}
🧩 Services Checked: ${servicesCount}
===============================================================
            `;
            PocketLog.info(summary);

            if (failCount > 0) {
                if (failedServices.length) {
                    const failedList = failedServices.map(f => ` - ${f}`).join("\n");
                    PocketLog.error(`🚫 The following services failed lint/syntax checks:\n${failedList}`);
                }
                throw new Error("Linting or syntax errors detected.");
            }

        } catch (error) {
            PocketLog.error("The server failed to start due to lint/syntax errors.", error);
            throw error;
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
                const method = gatewayConfig[moduleName][serviceName].method;
                const type = gatewayConfig[moduleName]?.[serviceName]?.type || null;
                const apiObject = {
                    module: moduleName,
                    service: serviceName,
                    endPoint: endPoint,
                    method: method,
                    type: type
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
    static getPocketMail() {
    return process.env.POCKET_MAIL;
}
    static getPocketMailPass() {
    return process.env.POCKET_MAIL_PASS;
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