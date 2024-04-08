import Pocket from './Pocket.js';
import PocketConfigManager from './PocketConfigManager.js';
import PocketList from './PocketList.js';
import { Console } from 'console';
import { Transform } from 'stream';
import crypto from 'crypto';
import validator from 'validator';
/**
 *
 * @author İsmet Murat Onay
 */
let PocketUtility = (
	function () {
		/**
		 * @example
		 * format : hour:minute AM/PM
		 * 18:57 PM
		 * 09:37 AM
		 */
		function GetRealTime() {
			let time = new Date();
			let hour = time.getHours().toString();
			hour = hour.length == 1 ? '0' + hour : hour;
			let minutes = time.getMinutes().toString();
			minutes = minutes.length == 1 ? '0' + minutes : minutes;
			let second = time.getSeconds().toString();
			second = second.length == 1 ? '0' + second : second;
			let result = hour + minutes + second;
			return result;
		}

		/**
		 * @param {String} format "yyyyMMdd" "yyyyDDmm" "ddMMyyyy" "mmDDyyyy" Default('yyyyMMdd')
		 * @param {String} seperate {'-', '/', '.'}
		 *
		 */
		function GetRealDate(format, separate) {
			function isSeparated() {
				return separate != undefined;
			}

			let date = new Date();
			let fullDate = "";

			let day =
				date.getDate().toString().length == 1
					? "0" + date.getDate()
					: date.getDate();
			let month =
				(date.getMonth() + 1).toString().length == 1
					? "0" + (date.getMonth() + 1)
					: (date.getMonth() + 1);
			let year = date.getFullYear();

			let DEFAULT = year.toString() + month.toString() + day.toString();
			let SEPARATED =
				year.toString() + separate + month.toString() + separate + day.toString();

			if (format == undefined) fullDate = DEFAULT;
			if (format == "yyyyMMdd") fullDate = !isSeparated() ? DEFAULT : SEPARATED;

			return fullDate;
		}
		/**
		 * @return
		 * return generateId format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaa'
		 */
		function GenerateOID() {
			let s4 = () => {
				return Math.floor((1 + Math.random()) * 0x10000)
					.toString()
					.substring(1);
			};
			//return id format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaa'
			return (
				s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4()
			);
		}

		function encrypt(plainText) {
			const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(PocketConfigManager.getEncryptKey(), 'hex'), Buffer.from('16BytesLengthKey'));
			let encrypted = cipher.update(plainText);
			encrypted = Buffer.concat([encrypted, cipher.final()]);
			return encrypted.toString('hex');
		}

		// AES çözme fonksiyonu
		function decrypt(encryptedText) {
			const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(PocketConfigManager.getEncryptKey(), 'hex'), Buffer.from('16BytesLengthKey'));
			let decrypted = decipher.update(Buffer.from(encryptedText, 'hex'));
			decrypted = Buffer.concat([decrypted, decipher.final()]);
			return decrypted.toString();
		}

		/**
		 *
		 * @param {String} email
		 * @returns
		 */
		function isValidEmail(email) {
			return validator.isEmail(email);
		}

		/**
		 *
		 * @param {Object} json
		 * @returns {Pocket}
		 */

		function ConvertToPocket(obj) {
			if (obj instanceof Pocket) {
				return obj; // Zaten bir Pocket nesnesi ise dönüştürmeye gerek yok
			} else if (Array.isArray(obj)) {
				const pocketList = new PocketList();
				obj.forEach((item, index) => {
					pocketList.add(this.ConvertToPocket(item)); // Dizideki her öğeyi dönüştürüp PocketList'e ekle
				});
				return pocketList;
			} else if (typeof obj === 'object' && obj !== null) {
				const pocket = new Pocket();
				for (const key in obj) {
					pocket.put(key, this.ConvertToPocket(obj[key])); // Her özelliği dönüştürüp Pocket'e ekle
				}
				return pocket;
			} else {
				return obj; // Diğer türlerde ise dönüştürmeye gerek yok
			}
		}
		function TimeStamp() {
			return Date.now();
		}

		function table(input) {
			const ts = new Transform({ transform(chunk, enc, cb) { cb(null, chunk) } })
			const logger = new Console({ stdout: ts })
			logger.table(input)
			const table = (ts.read() || '').toString()
			let result = '';
			for (let row of table.split(/[\r\n]+/)) {
				let r = row.replace(/[^┬]*┬/, '┌');
				r = r.replace(/^├─*┼/, '├');
				r = r.replace(/│[^│]*/, '');
				r = r.replace(/^└─*┴/, '└');
				r = r.replace(/'/g, ' ');
				result += `${r}\n`;
			}
			console.log(result);
		}
		/**
		 *
		 * @param {any} obj
		 * @returns {Boolean}
		 */
		function isEmptyObject(object) {
			for (let checker in object) {
				return !1;
			}
			return !0;
		}
		/**
		 *
		 * @param {String} str
		 */
		function ReverseString(str) {
			return str.split("").reverse().join("");
		}

		function isObject(value) {
			return Object.prototype.toString.call(value) == "[object Object]"
		}
		function isArray(value) {
			return Object.prototype.toString.call(value) == "[object Array]"
		}
		function isString(value) {
			return Object.prototype.toString.call(value) == "[object String]"
		}
		function isNumber(value) {
			return Object.prototype.toString.call(value) == "[object Number]"
		}
		async function createExceptionLog(client, error, functionName) {
			let out = new Pocket();
			out.put("source", functionName)
				.put("stack", error.stack)
				.put("message", error.message)
				.put("date", PocketUtility.GetRealDate())
				.put("time", PocketUtility.GetRealTime())
				.put("error", error);
			await client.db("admin").collection("ErrorLogs").insertOne(out);
		}
		function convertUnixTimestamp(unixTimestamp) {
			const date = new Date(unixTimestamp);

			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const hours = String(date.getHours()).padStart(2, '0');
			const minutes = String(date.getMinutes()).padStart(2, '0');
			const seconds = String(date.getSeconds()).padStart(2, '0');
			const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

			return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}:${milliseconds}`;
		}
		function LoggerTimeStamp(params) {
			return convertUnixTimestamp(TimeStamp());
		}
		function timeGap(date1, date2) {
			const timestamp1 = new Date(date1).getTime();
			const timestamp2 = new Date(date2).getTime();

			const diff = Math.abs(timestamp1 - timestamp2);

			const milliseconds = diff % 1000;
			const seconds = Math.floor(diff / 1000) % 60;
			const minutes = Math.floor(diff / (1000 * 60)) % 60;
			const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
			const days = Math.floor(diff / (1000 * 60 * 60 * 24));

			return {
				days,
				hours,
				minutes,
				seconds,
				milliseconds
			};
		}
		function isValidDate(date) {
			const currentDate = new Date();
			const targetDate = new Date(date);

			return currentDate < targetDate;
		}

		function isExpiredDate(date, expiredSecond) {
			// Şu anki zamanı al
			let now = new Date();

			// Gelen 'date' değişkenini Date objesine dönüştür
			let inputDate = new Date(date);

			// Geçerli zamanı artır
			inputDate.setSeconds(inputDate.getSeconds() + expiredSecond);

			// Eğer gelen tarih, şu anki zamandan büyükse true döndür
			return inputDate < now;
		}

		return {
			GetRealTime: GetRealTime,
			GetRealDate: GetRealDate,
			GenerateOID: GenerateOID,
			ReverseString: ReverseString,
			isEmptyObject: isEmptyObject,
			table: table,
			TimeStamp: TimeStamp,
			ConvertToPocket: ConvertToPocket,
			encrypt: encrypt,
			decrypt: decrypt,
			isObject: isObject,
			isArray: isArray,
			isString: isString,
			isNumber: isNumber,
			createExceptionLog: createExceptionLog,
			LoggerTimeStamp: LoggerTimeStamp,
			timeGap: timeGap,
			isValidDate: isValidDate,
			isExpiredDate: isExpiredDate,
			isValidEmail: isValidEmail
		}
	}
)();
export default PocketUtility;
