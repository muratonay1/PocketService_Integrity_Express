import { PocketLib } from "../util/constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;
import dotenv from 'dotenv';
/**
 * Pocket CheckAbuseipAttacker servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const CheckAbuseipAttacker = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "ip")
          dotenv.config();
          // API key ve kontrol edilecek IP adresi
          const apiKey =  process.env.ABUSE_IP_TOKEN;
          const ipAddress = criteria.ip;

          const url = process.env.ABUSE_IP_URL;

          // URL parametrelerini oluştur
          const params = new URLSearchParams({
               ipAddress: ipAddress,
               maxAgeInDays: 90,
               verbose: true
          });

          const response = await fetch(`${url}?${params}`, {
               method: 'GET',
               headers: {
                    'Key': apiKey,
                    'Accept': 'application/json'
               }
          });

          if (!response.ok) {
               throw new Error(`Fetch request failed with status: ${response.status}`);
          }

          const data = await response.json();
          return evaluateIpRisk(data.data);
     } catch (error) {
          PocketLog.error(`CheckAbuseipAttacker servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

function evaluateIpRisk(data) {
     const {
          abuseConfidenceScore,
          isWhitelisted,
          totalReports,
          lastReportedAt,
          usageType,
          reports,
          ipAddress
     } = data;

     // Tehlike düzeyi
     let riskLevel = 0;

     // 1. abuseConfidenceScore değerlendirme
     if (abuseConfidenceScore >= 80) {
          riskLevel += 3; // Yüksek risk
     } else if (abuseConfidenceScore >= 50) {
          riskLevel += 2; // Orta risk
     } else if (abuseConfidenceScore > 0) {
          riskLevel += 1; // Düşük risk
     }

     // Eğer abuseConfidenceScore sıfırsa ve rapor yoksa risk düzeyini artırmayacağız.
     if (abuseConfidenceScore === 0 && totalReports === 0) {
          return {
               status: 'no-risk',
               message: 'Bu IP adresi güvenli görünüyor ve risk taşımıyor.'
          };
     }

     // 2. Beyaz liste durumu
     if (isWhitelisted === false) {
          riskLevel += 1; // Beyaz listeye alınmamış IP
     }

     // 3. Toplam rapor sayısı
     if (totalReports > 0) {
          riskLevel += totalReports >= 10 ? 3 : totalReports >= 3 ? 2 : 1;
     }

     // 4. Son raporlanma tarihi
     if (lastReportedAt) {
          const lastReportedDate = new Date(lastReportedAt);
          const currentDate = new Date();
          const timeSinceLastReport = Math.floor((currentDate - lastReportedDate) / (1000 * 60 * 60 * 24)); // Gün cinsinden
          if (timeSinceLastReport <= 30) {
               riskLevel += 2; // Son 30 gün içinde raporlanmışsa
          } else if (timeSinceLastReport <= 365) {
               riskLevel += 1; // Son 1 yıl içinde raporlanmışsa
          }
     }

     // 5. usageType (Veri merkezleri genellikle risk taşır)
     if (usageType && usageType.includes("Data Center")) {
          riskLevel += 1; // Veri merkezi IP'leri genelde risklidir
     }

     // 6. Rapor detayları
     if (reports && reports.length > 0) {
          reports.forEach(report => {
               const { categories } = report;
               // 18 ve 22 gibi kategoriler genellikle saldırgan aktiviteleri işaret eder
               if (categories.includes(18) || categories.includes(22)) {
                    riskLevel += 2; // Saldırgan aktivite kategorileri
               }
          });
     }

     // Sonuç değerlendirme
     if (riskLevel >= 8) {
          return {
               ipAddress:ipAddress,
               status: 'high-risk',
               message: 'Bu IP büyük olasılıkla saldırgan ve yüksek risk taşıyor.'
          };
     } else if (riskLevel >= 5) {
          return {
               ipAddress:ipAddress,
               status: 'medium-risk',
               message: 'Bu IP orta düzeyde risk taşıyor, dikkatli olunmalı.'
          };
     } else if (riskLevel > 0) {
          return {
               ipAddress:ipAddress,
               status: 'low-risk',
               message: 'Bu IP düşük risk taşıyor, şu an için ciddi bir tehdit oluşturmuyor.'
          };
     } else {
          return {
               ipAddress:ipAddress,
               status: 'no-risk',
               message: 'Bu IP adresi güvenli görünüyor ve risk taşımıyor.'
          };
     }
}


export default CheckAbuseipAttacker;