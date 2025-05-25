import WebSocket from 'ws';
import PocketConfigManager from './PocketConfigManager.js';
import PocketLog from './PocketLog.js';
/**
 * TODO: socket alt yapısı için temel servis, batchs ve config kontrolleri tamamlanacak.
 */
class PocketWebSocket {
     constructor (methods = {}) {
          this.port = PocketConfigManager.getSocketPort();
          this.methods = methods;
          this.server = null;
          this.counter = 0;
          this.users = {};
          this.allUsers = [];
          this.welcomeMessage = "P O C K E T   I N T E G R A T E    W E B S O C K E T    S E R V E R";
     }

     start() {
          console.clear();
          PocketLog.info(this.welcomeMessage);
          PocketLog.info("WebSocket Server is getting ready...");

          this.server = new WebSocket.Server({ port: this.port });

          this.server.on('connection', this.handleConnection.bind(this));

          PocketLog.info("WebSocket Server is running on port: " + this.port + "\n")
     }

     handleConnection(connection) {
          connection.on('message', this.handleMessage.bind(this, connection));
          ++this.counter;
          PocketLog.info("User Connected Web Socket Server");
          PocketLog.info('Total Client: '+this.counter);
     }

     handleMessage(connection, message) {
          let data;
          try {
               data = JSON.parse(message);
          } catch (e) {
               PocketLog.error("Invalid JSON");
               PocketLog.error(e);
               return;
          }

          if (typeof this.methods[data.type] === 'function') {
               this.methods[data.type].call(this, connection, data);
          } else {
               PocketLog.warn("Unknown client request")
          }
     }

     sendTo(connection, message) {
          connection.send(JSON.stringify(message));
     }
}

export default PocketWebSocket;
