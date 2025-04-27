import fs from 'fs';
import chalk from 'chalk';
import path from 'path';
import PocketUtility from './PocketUtility.js';
import Pocket from './Pocket.js';

/**
 * Log fonksiyonuna log çağrısını yapan dosyanın adını ekler
 */
let PocketLog = (
    function () {
        const logFilePath = path.join(process.cwd(), 'pocket.log'); // Log dosyasının yolu

        /**
         * Stack trace'den `at` ile başlayan ilk dosya adını alır
         * @returns {String} fileName
         */
        function getCallerFileName() {
            const trace = new Error().stack.split('\n');

            for (let i = 0; i < trace.length; i++) {
                const caller = trace[i].trim();
                if (caller.startsWith('at file') || caller.startsWith('at PocketService.executeService')) {
                    const match = caller.match(/at file:\/\/\/(.*\.(js|mjs))/);
                    if (match) {
                        const filePath = match[1];
                        return filePath.split('/').pop();
                    }
                }
            }
            return 'unknown';
        }

        /**
         * Log mesajını dosyaya yazdırır
         * @param {String} logMessage Log mesajı
         */
        function writeToFile(logMessage) {
            try {
                fs.appendFileSync(logFilePath, logMessage + '\n', 'utf8'); // Log mesajını dosyaya ekle
            } catch (err) {
                console.error(chalk.red('Log dosyasına yazılamadı:'), err);
            }
        }

        /**
         * Genel log fonksiyonu
         * @param {String} level Log seviyesi (INFO, ERROR, vb.)
         * @param {String} message Mesaj
         */
        function log(level, message) {
            const fileName = getCallerFileName();
            const timeStamp = PocketUtility.LoggerTimeStamp();
            const logMessage = `[${level}] [${timeStamp}] [${fileName}]: ${message}`;

            // Mesajı dosyaya yaz
            writeToFile(logMessage);

            // Konsola yazdırma
            if (level === 'ERROR') {
                console.error(chalk.red(logMessage));
            } else if (level === 'WARNING') {
                console.warn(chalk.yellow(logMessage));
            } else {
                if (Pocket.isPocket(logMessage)) {
                    console.info(chalk.blueBright(JSON.stringify(logMessage, null, 2)));
                } else {
                    console.info(chalk.blueBright(logMessage));
                }
            }
        }

        return {
            info: (message) => log('INFO', message),
            error: (message, error) => log('ERROR', `${message}\n${error}`),
            warn: (message) => log('WARNING', message),
            request: (message) => log("REQUEST", message)
        };
    }
)();

export default PocketLog;
