import chalk from 'chalk';
/**
 *
 * @author İsmet Murat Onay
 */

import PocketUtility from "./PocketUtility.js";

let PocketLog = (
	function() {
        /**
         *
         * @param {String} message
         */
		function log(message) {
            console.log(chalk.white(`[POCKET LOG] [${PocketUtility.LoggerTimeStamp()}]: ${message}`));
        }
        /**
         *
         * @param {String} message
         */
        function error(message,error) {
            console.error(chalk.red(`[POCKET ERROR] [${PocketUtility.LoggerTimeStamp()}]:${message}\n ${error}`));
        }
        /**
         *
         * @param {String} message
         */
        function warn(message) {
            console.warn(chalk.yellow(`[POCKET WARNING] [${PocketUtility.LoggerTimeStamp()}]: ${message}`));
        }
        /**
         *
         * @param {String} message
         */
        function info(message) {
            console.info(chalk.blueBright(`[POCKET INFO] [${PocketUtility.LoggerTimeStamp()}]: ${message}`));
        }

		return {
            log:log,
            error:error,
            warn:warn,
            info:info
		}
	}
)();

export default PocketLog;