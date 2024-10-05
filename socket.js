import PocketWebSocket from "./pocket-core/PocketWebSocket.js";
/**
 * basic socket alt yapısı, core temeli tamamlanınca methods yapısı düzenlenecek.
 */
const methods = {
    login: function (connection, data) {
        const username = data.username;
        if (!username) {
            this.sendTo(connection, {
                type: "login",
                success: false,
                message: "Kullanıcı adı boş olamaz."
            });
            return;
        }

        if (this.users[username]) {
            this.sendTo(connection, {
                type: "login",
                success: false,
                message: "Kullanıcı adı zaten kullanımda."
            });
            return;
        }
        connection.username = username;
        this.users[username] = connection;


        this.sendTo(connection, {
            type: "login",
            success: true,
            username: username,
            message: "Başarıyla giriş yapıldı."
        });
    },
    message:function()
};

const pocketWS = new PocketWebSocket(methods);

pocketWS.start();