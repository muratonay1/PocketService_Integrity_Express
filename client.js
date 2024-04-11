import WebSocket from 'ws';
// WebSocket sunucusunun adresini ve portunu belirtin
const serverAddress = 'ws://localhost:8000';

// WebSocket bağlantısını oluşturun
const ws = new WebSocket(serverAddress);

// Bağlandığında
ws.on('open', function open() {
     console.log('Bağlantı kuruldu.');

     // Login işlemi için bir mesaj gönderin
     const message = {
          type: 'login',
          username: 'murat' // Burada kullanıcı adınızı belirtin
     };
     ws.send(JSON.stringify(message));
});

// Sunucudan mesaj aldığınızda
ws.on('message', function incoming(data) {
     console.log('Alınan mesaj:', data);
});

// Bağlantı kapandığında
ws.on('close', function close() {
     console.log('Bağlantı kapatıldı.');
});

// Hata oluştuğunda
ws.on('error', function error(err) {
     console.error('Hata:', err);
});
