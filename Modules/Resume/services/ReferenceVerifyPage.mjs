import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket ReferenceVerifyPage servisi
 * @param {Pocket} criteria
 * @returns {Promise<string>} - HTML döndürür
 */
const ReferenceVerifyPage = execute(async (criteria) => {
    try {
        // Gelen kriterleri örnek olarak kullanabilirsiniz
        PocketService.parameterMustBeFill(criteria, "token");

        // HTML çıktısı oluşturuluyor
        const htmlContent =
        `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Referans Doğrulama</title>
                <style>
                    body {
                        font-family: 'Roboto', sans-serif;
                        background: linear-gradient(to right, #6a11cb, #2575fc);
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        color: #ffffff;
                    }
                    .container {
                        background: #ffffff;
                        color: #333;
                        padding: 15px;
                        border-radius: 10px;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                        width: 100%;
                        max-width: 400px;
                    }
                    h1 {
                        font-size: 1.4rem;
                        margin-bottom: 10px;
                        text-align: center;
                        color: #6a11cb;
                    }
                    p {
                        font-size: 12px;
                        color: #555;
                        margin-bottom: 15px;
                        text-align: center;
                    }
                    .warning {
                        font-size: 13px;
                        color: #d9534f;
                        font-weight: bold;
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    a {
                        color: #6a11cb;
                        text-decoration: none;
                        font-weight: bold;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                    .form-group {
                        margin-bottom: 15px;
                        text-align: left;
                    }
                    label {
                        display: block;
                        margin-bottom: 6px;
                        font-weight: bold;
                        font-size: 12px;
                    }
                    .hint {
                        font-size: 11px;
                        color: #888;
                        margin-top: 4px;
                    }
                    input[type="text"], input[type="email"], input[type="url"], select {
                        width: 100%;
                        padding: 8px;
                        border: 1px solid #ddd;
                        border-radius: 6px;
                        box-sizing: border-box;
                        font-size: 12px;
                        transition: border-color 0.3s;
                    }
                    input[type="text"]:focus, input[type="email"]:focus, input[type="url"]:focus {
                        border-color: #6a11cb;
                        outline: none;
                    }
                    input[type="checkbox"] {
                        margin-right: 8px;
                    }
                    button {
                        background: linear-gradient(to right, #6a11cb, #2575fc);
                        color: white;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 13px;
                        width: 100%;
                        transition: background 0.3s;
                    }
                    button:hover {
                        background: linear-gradient(to right, #2575fc, #6a11cb);
                    }
                    .note {
                        font-size: 10px;
                        color: #888;
                        text-align: center;
                        margin-top: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Referans Doğrulama</h1>
                    <div class="warning">Dikkat: Verdiğiniz bilgiler <a href="https://www.muratonay.com.tr" target="_blank">www.muratonay.com.tr</a> adresinde yayınlanacaktır ve bu bilgilere herkes erişebilir.</div>
                    <form id="referenceForm">
                        <div class="form-group">
                            <label for="firstName">İsim:</label>
                            <input type="text" id="firstName" name="firstName" required>
                        </div>
                        <div class="form-group">
                            <label for="lastName">Soyisim:</label>
                            <input type="text" id="lastName" name="lastName" required>
                        </div>
                        <div class="form-group">
                            <label for="profession">Meslek:</label>
                            <input type="text" id="profession" name="profession" required>
                        </div>
                        <div class="form-group">
                            <label for="tag">Çalıştığı Yerdeki Tag:</label>
                            <input type="text" id="tag" name="tag">
                            <div class="hint">Örnek: TeamLeader</div>
                        </div>
                        <div class="form-group">
                            <label for="workplace">Çalıştığı Yer:</label>
                            <input type="text" id="workplace" name="workplace" required>
                            <div class="hint">Örnek: Murat Onay Ltd. Şti.</div>
                        </div>
                        <div class="form-group">
                            <label for="email">E-posta:</label>
                            <input type="email" id="email" name="email" required>
                            <div class="hint">Lütfen geçerli bir e-posta adresi girin.</div>
                        </div>
                        <div class="form-group">
                            <label for="linkedin">LinkedIn Adresi:</label>
                            <input type="url" id="linkedin" name="linkedin">
                            <div class="hint">Tam URL: https://www.linkedin.com/in/username</div>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="referenceCheck" name="referenceCheck" required>
                                Referans olmayı kabul ediyorum.
                            </label>
                        </div>
                        <button type="submit">Gönder</button>
                    </form>
                    <div class="note">Verileriniz gizlilik politikası çerçevesinde işlenecektir.</div>
                </div>

                <script>
                    document.getElementById('referenceForm').addEventListener('submit', async (event) => {
                        event.preventDefault();

                        const formData = {
                            firstName       : document.getElementById('firstName').value,
                            lastName        : document.getElementById('lastName').value,
                            profession      : document.getElementById('profession').value,
                            tag             : document.getElementById('tag').value,
                            workplace       : document.getElementById('workplace').value,
                            email           : document.getElementById('email').value,
                            linkedin        : document.getElementById('linkedin').value,
                            referenceCheck  : document.getElementById('referenceCheck').checked,
                            token           : this.location.search.split("?token=")[1],
                        };

                        try {
                            const response = await fetch('http://localhost:3000/api/', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(formData)
                            });

                            if (response.ok) {
                                alert('Başarıyla gönderildi!');
                            } else {
                                alert('Bir hata oluştu, lütfen tekrar deneyin.');
                            }
                        } catch (error) {
                            console.error('Hata:', error);
                            alert('Bir hata oluştu, lütfen tekrar deneyin.');
                        }
                    });
                </script>
            </body>
            </html>
        `;

        return htmlContent;
    } catch (error) {
        PocketLog.error(`ReferenceVerifyPage servisinde hata meydana geldi: ${error.message}`);
        throw new Error(error);
    }
});

export default ReferenceVerifyPage;