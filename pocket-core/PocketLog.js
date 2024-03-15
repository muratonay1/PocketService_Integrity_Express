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
            console.log(`[POCKET LOG] [${PocketUtility.LoggerTimeStamp()}]: ${message}`);
        }
        /**
         *
         * @param {String} message
         */
        function error(message,error) {
            console.error(`[POCKET ERROR] [${PocketUtility.LoggerTimeStamp()}]:${message}\n ${error}`);
        }
        /**
         *
         * @param {String} message
         */
        function warn(message) {
            console.warn(`[POCKET WARNING] [${PocketUtility.LoggerTimeStamp()}]: ${message}`);
        }
        /**
         *
         * @param {String} message
         */
        function info(message) {
            console.info(`[POCKET INFO] [${PocketUtility.LoggerTimeStamp()}]: ${message}`);
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