import Pocket from './Pocket.js';
import PocketQueryFilter from './PocketQueryFilter.js';
import PocketConfigManager from './PocketConfigManager.js';
import { dbClient } from "./PocketMongo.js";
import PocketUtility from './PocketUtility.js';
import crypto from 'crypto';
export default class PocketSecrets
{
     static async encrypt(plainText) {

          const key = Buffer.from(PocketConfigManager.getEncryptKey(), 'hex');
          const iv = crypto.randomBytes(16);

          const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

          let encrypted = cipher.update(plainText, 'utf8', 'hex');
          encrypted += cipher.final('hex');

          const authTag = cipher.getAuthTag();

          let uniqueId = PocketUtility.GenerateOID();

          let insertPocket = Pocket.create();

          insertPocket.put("id",uniqueId);
          insertPocket.put("iv",iv.toString('hex'));
          insertPocket.put("authTag",authTag.toString('hex'));

          const insertResult = await new Promise((resolve, reject) => {
               dbClient.executeInsert({
                    from: "pocket.secrets",
                    params: insertPocket,
                    done: resolve,
                    fail: reject
               })
          });

          if(insertResult)
          {
               return {
                    id: uniqueId,
                    content : encrypted
               };
          }

          throw new Error("Encrypted Error");
     }

     static async decrypt(encryptedObject) {

          let filter = new PocketQueryFilter();
          filter.add("id",encryptedObject.id).operator("==");

          const searchResult = await new Promise((resolve, reject) => {

               dbClient.executeGet({
                    from: "pocket.secrets",
                    where: filter,
                    done: resolve,
                    fail: reject
               });
          });

          if(searchResult.length == 0){
               throw new Error("Şifre kaydı bulunamadı.");
          }

          let secretRegister = searchResult[0];

          const key = Buffer.from(PocketConfigManager.getEncryptKey(), 'hex');
          const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(secretRegister.iv, 'hex'));

          decipher.setAuthTag(Buffer.from(secretRegister.authTag, 'hex')); // Set authentication tag

          let decrypted = decipher.update(encryptedObject.content, 'hex', 'utf8');
          decrypted += decipher.final('utf8');

          return decrypted;
     }
}