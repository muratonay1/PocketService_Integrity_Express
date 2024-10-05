import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket HtmlTemplateTest servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const HtmlTemplateTest = execute(async (criteria) => {
     try {
          const username = "John Doe";

          var htmlTemplate = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>HTML Response</title>
          </head>
          <body>
            <h1>Merhaba, ${username}!</h1>
            <p id="message">Yükleniyor...</p>
            <script>
              // HTML içinde bir servis çağrısı (API çağrısı) yapma
              fetch('/api/data')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('message').innerText = data.message;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            </script>
          </body>
          </html>
        `;
          return htmlTemplate;
     } catch (error) {
          PocketLog.error(`HtmlTemplateTest servisinde hata meydana geldi."` + error);
          throw new Error(error);
     }
});

export default HtmlTemplateTest;