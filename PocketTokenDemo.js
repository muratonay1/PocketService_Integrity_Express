import { PocketLib } from "./Util/MainConstants.js";
const {
     PocketConfigManager,
     PocketLog,
     PocketMongo,
     PocketQueryFilter,
     PocketService,
     PocketToken,
     execute,
     dbClient,
     Pocket,
     PocketUtility,
     PocketMailManager } = PocketLib;

const token = await PocketToken.generateAndSaveToken({
     project:"pocket-ui",
     type:PocketToken.TokenType.LOGIN_VERIFY_EMAIL,
     expiresIn:"3m",
     payloadData:{
          "username":"admin",
          "email":"imuratony@gmail.com"
     }
})
console.log(token);
