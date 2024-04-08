import { PocketLib } from "../constants.js";
const { PocketUtility } = PocketLib;


let ResumeUtil = (
	function () {
		function validateName(name) {
			const minLength = 2;
			const maxLength = 30;
			const namePattern = /^[a-zA-ZğüşöçİĞÜŞÖÇ\s]+$/;

			if (typeof name !== 'string') {
				throw new Error('Name must be a string.');
			}

			if (name.length < minLength || name.length > maxLength) {
				throw new Error('Name length must be between ' + minLength + ' and ' + maxLength + ' characters.');
			}

			if (!namePattern.test(name)) {
				throw new Error('Name must contain only letters and spaces.');
			}
		}
		function validateSubject(subject) {
			const minLength = 5;
			const maxLength = 100;

			if (subject.length < minLength || subject.length > maxLength) {
				throw new Error('Subject length must be between ' + minLength + ' and ' + maxLength + ' characters.');
			}
		}

		function validateEmail(email) {
			const emailPattern = /^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]{3,}\.[a-zA-Z]{2,}$/;

			if (!emailPattern.test(email)) {
				throw new Error('Invalid email address.');
			}
		}

		function validateMessage(message) {
			const maxLength = 1000;

			if (message.length > 1000) {
				throw new Error('Message length must be lower then ' + maxLength + ' characters.');
			}
		}

		function validateIp(ip) {
			const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

			if(!ipPattern.test(ip)){
				throw new Error("Ip format is not suitable")
			}
		}

		function validateSenderInfo(senderInfo) {
			if(PocketUtility.isEmptyObject(senderInfo)){
				throw new Error("senderInfo must be fill.");
			}
			if(PocketUtility.isObject()){
				throw new Error("senderInfo type, must be an object-Object");
			}
		}

		return {
			validateName: validateName,
			validateSubject: validateSubject,
			validateEmail: validateEmail,
			validateMessage: validateMessage,
			validateIp: validateIp,
			validateSenderInfo: validateSenderInfo
		}
	}
)();
export default ResumeUtil;
