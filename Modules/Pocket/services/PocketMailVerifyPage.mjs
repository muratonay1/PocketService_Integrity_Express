import { PocketLib } from "../constants.js";
const { PocketLog, PocketService, execute, dotenv } = PocketLib;

/**
 * Pocket EmailVerifyPage servisi
 * Kullanıcının e-posta adresini doğrulama linkine tıkladığında gördüğü sayfayı oluşturur.
 * @param {Pocket} criteria - Gelen istek kriterleri, token içermelidir.
 * @returns {Promise<string>} - Profesyonel bir onay HTML sayfası döndürür.
 */
const PocketMailVerifyPage = execute(async (criteria) => {
     try {
          // Linkin ?token=... ile gelmesi zorunludur.
          PocketService.parameterMustBeFill(criteria, "token");

          // HTML çıktısı oluşturuluyor
          const htmlContent = `
            <!DOCTYPE html>
            <html lang="tr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>E-posta Doğrulama</title>
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
                        padding: 30px 40px;
                        border-radius: 12px;
                        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                        width: 100%;
                        max-width: 450px;
                        text-align: center;
                        transform: scale(0.95);
                        opacity: 0;
                        animation: fadeInScale 0.5s forwards ease-out;
                    }
                    @keyframes fadeInScale {
                        to {
                            transform: scale(1);
                            opacity: 1;
                        }
                    }
                    .icon {
                        margin-bottom: 20px;
                    }
                    .icon svg {
                        width: 80px;
                        height: 80px;
                    }
                    h1 {
                        font-size: 1.8rem;
                        margin-bottom: 15px;
                        color: #6a11cb;
                    }
                    p {
                        font-size: 1rem;
                        color: #555;
                        line-height: 1.6;
                        margin-bottom: 25px;
                    }
                    a.button {
                        display: inline-block;
                        background: linear-gradient(to right, #6a11cb, #2575fc);
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 1rem;
                        font-weight: bold;
                        text-decoration: none;
                        transition: all 0.3s;
                    }
                    a.button:hover {
                        background: linear-gradient(to right, #2575fc, #6a11cb);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    }
                    .status-container {
                        /* Hata ve başarı mesajları için alan */
                    }
                    .hidden {
                        display: none;
                    }
                </style>
            </head>
            <body>
                <div class="container">

                    <div id="successState" class="status-container hidden">
                        <div class="icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#4CAF50"/>
                            </svg>
                        </div>
                        <h1>Doğrulama Başarılı! ✅</h1>
                        <p>E-posta adresiniz başarıyla doğrulandı. Artık hesabınızın tüm özelliklerini kullanabilirsiniz.</p>
                        <a href="https://www.muratonay.com.tr/login" class="button">Giriş Yap</a>
                    </div>

                    <div id="errorState" class="status-container hidden">
                        <div class="icon">
                             <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#D9534F"/>
                            </svg>
                        </div>
                        <h1>Doğrulama Başarısız! ❌</h1>
                        <p id="errorMessage">Geçersiz veya süresi dolmuş bir doğrulama linki kullandınız. Lütfen tekrar deneyin veya destek ekibimizle iletişime geçin.</p>
                    </div>

                    <div id="loadingState" class="status-container">
                         <h1>Doğrulama Yapılıyor...</h1>
                         <p>E-posta adresiniz doğrulanıyor, lütfen kısa bir süre bekleyin.</p>
                    </div>

                </div>

                <script>
                    document.addEventListener('DOMContentLoaded', async () => {
                        const loadingState = document.getElementById('loadingState');
                        const successState = document.getElementById('successState');
                        const errorState = document.getElementById('errorState');
                        const errorMessage = document.getElementById('errorMessage');

                        const token = new URLSearchParams(window.location.search).get('token');

                        if (!token) {
                            loadingState.classList.add('hidden');
                            errorMessage.innerText = "Doğrulama linkinde token bulunamadı.";
                            errorState.classList.remove('hidden');
                            return;
                        }

                        try {
                            // 1. Temel URL'i ve parametreleri hazırlıyoruz.
                            const baseUrl = 'http://localhost:3000/api/verify-email-token';
                            const params = new URLSearchParams({
                                token: token // Gönderilecek token'ı parametre olarak ekliyoruz.
                            });

                            // 2. Son URL'i oluşturuyoruz: "http://.../api/verify-email-token?token=eyJ..."
                            const urlWithParams = \`\${baseUrl}?\${params.toString()}\`;

                            // 3. GET isteğini gönderiyoruz. Body veya Content-Type başlığı YOK.
                            const response = await fetch(urlWithParams, {
                                // GET isteği varsayılan olduğu için method belirtmeye gerek yok.
                                headers: {
                                    // Sadece gerekli özel başlıkları ekliyoruz.
                                    'x-user-token': '65d78580994151d94460ea1f'
                                }
                            });

                            // İstek tamamlandıktan sonra "yükleniyor" animasyonunu gizliyoruz.
                            loadingState.classList.add('hidden');

                            // 4. Sunucudan gelen cevabı işliyoruz.
                            if (response.ok) {
                                // Başarılı ise başarı ekranını gösteriyoruz.
                                successState.classList.remove('hidden');
                            } else {
                                // Başarısız ise sunucudan gelen hata mesajını güvenli bir şekilde işliyoruz.
                                let errorText = \`Bir hata oluştu (Kod: \${response.status}). Lütfen tekrar deneyin.\`;

                                const contentType = response.headers.get('content-type');
                                if (contentType && contentType.includes('application/json')) {
                                    const errorData = await response.json();
                                    errorText = errorData.error || JSON.stringify(errorData);
                                } else {
                                    errorText = await response.text();
                                }

                                errorMessage.innerText = errorText;
                                errorState.classList.remove('hidden');
                            }
                        } catch (error) {
                            // Bu blok, ağ hataları gibi durumlarda çalışır.
                            console.error('Fetch Hatası:', error);

                            loadingState.classList.add('hidden');
                            errorMessage.innerText = 'Sunucuya bağlanırken bir sorun oluştu. İnternet bağlantınızı kontrol edin.';
                            errorState.classList.remove('hidden');
                        }
                    });
                </script>
            </body>
            </html>
        `;

          return htmlContent;
     } catch (error) {
          PocketLog.error(`PocketMailVerifyPage servisinde hata meydana geldi: ${error.message}`);
          throw new Error(error.message);
     }
});

export default PocketMailVerifyPage;
