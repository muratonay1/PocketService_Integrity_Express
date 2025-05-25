import fetch from 'node-fetch';
class PocketRemoteRequest {
     /**
      * Genel uzaktan istek işlevi
      * @param {string} url - İstek yapılacak URL
      * @param {string} method - İstek yöntemi (GET, POST, PUT, DELETE, vb.)
      * @param {object} data - İstek verisi (isteğe bağlı)
      * @returns {Promise<object>} - İstek cevabı
      */
     static async execute(url, method = 'GET', data = {}) {
          try {
               const options = {
                    method,
                    headers: {
                         'Content-Type': 'application/x-www-form-urlencoded'
                    }
               };

               if (method !== 'GET') {
                    options.body = JSON.stringify(data);
               }

               const response = await fetch(url, options);

               if (!response.ok) {
                    throw new Error('Fetch request failed');
               }

               return await response.json();
          } catch (error) {
               throw new Error(`PocketRemoteRequest failed: ${error.message}`);
          }
     }
}

export default PocketRemoteRequest;
