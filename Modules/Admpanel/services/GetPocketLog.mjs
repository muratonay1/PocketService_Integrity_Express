import fs from 'fs';
import path from 'path';
import { PocketLib } from "../constants.js";

const { PocketLog, execute } = PocketLib;

/**
 * Pocket GetPocketLog servisi
 * @param {Pocket} criteria
 * @returns {Promise<string[]>}
 */
const GetPocketLog = execute(async (criteria = {}) => {
    try {
        const { startDate, endDate, level, service } = criteria;

        const validateDateFormat = (dateString) => {
            const dateFormatRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
            if (!dateFormatRegex.test(dateString)) {
                throw new Error(`Geçersiz tarih formatı: ${dateString}. Format "YYYY-MM-DD HH:mm:ss" olmalıdır.`);
            }

            const [year, month, day, hour, minute, second] = dateString
                .replace(/[- :]/g, ',')
                .split(',')
                .map(Number);
            const date = new Date(year, month - 1, day, hour, minute, second);

            if (
                date.getFullYear() !== year ||
                date.getMonth() + 1 !== month ||
                date.getDate() !== day ||
                date.getHours() !== hour ||
                date.getMinutes() !== minute ||
                date.getSeconds() !== second
            ) {
                throw new Error(`Geçersiz tarih: ${dateString}.`);
            }
        };

        if (startDate) validateDateFormat(startDate);
        if (endDate) validateDateFormat(endDate);

        if (startDate || endDate) {
            const today = new Date();
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start && end) {
                const timeDifference = Math.abs(end - start);
                const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
                if (daysDifference > 7) {
                    throw new Error('İki tarih arası 1 haftadan fazla olamaz.');
                }
            }

            if (start && end && start > end) {
                throw new Error('Başlangıç tarihi bitiş tarihinden büyük olamaz.');
            }

            if (start && end && start.getTime() === end.getTime()) {
                throw new Error('Başlangıç ve bitiş tarihi aynı olamaz.');
            }

            if ((start && start > today) || (end && end > today)) {
                throw new Error('Gelecekteki bir tarih için sorgulama yapılamaz.');
            }
        }

        const logFilePath = path.join(process.cwd(), 'pocket.log');

        const logData = await fs.promises.readFile(logFilePath, 'utf8');

        const logs = logData.split(/\n(?=\[\w+\])/);

        const filteredLogs = logs.filter((log) => {
            const dateMatch = log.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}:\d{3})\]/);
            const logDate = dateMatch ? new Date(dateMatch[1]) : null;

            const isDateInRange =
                logDate &&
                (!startDate || new Date(startDate) <= logDate) &&
                (!endDate || logDate <= new Date(endDate));

            const isLevelMatch = level ? log.includes(`[${level}]`) : true;
            const isServiceMatch = service ? log.includes(`[${service}]`) : true;

            return (!startDate && !endDate && !level && !service) || (isDateInRange && isLevelMatch && isServiceMatch);
        });

        return filteredLogs;
    } catch (error) {
        PocketLog.error(`GetPocketLog servisinde hata meydana geldi: ${error.message}`);
        throw new Error(error.message);
    }
});
export default GetPocketLog;