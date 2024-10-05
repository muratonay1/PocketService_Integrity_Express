import { Modules, PocketLib, Status } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket } = PocketLib;

/**
 * Pocket Login servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const Login = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "inputMail,inputPassword");

          let searchAccountParameter = Pocket.create();
          searchAccountParameter.put("userName",criteria.get("inputMail",String));
          searchAccountParameter.put("password",criteria.get("inputPassword",String));

          const responseAccountService = await PocketService.executeService(`GetAccount`, Modules.MENUHTML, searchAccountParameter);

          validateLogin(responseAccountService.data);

          let responseLoginData = {

          };
          return responseAccountService;
     } catch (error) {
          PocketLog.error(`Login servisinde hata meydana geldi."` + error);
          throw new Error(error.message);
     }
});

function validateLogin(userData){
     if(userData.activation == Status.PASSIVE){
          throw new Error("user " + " [" + userData.userName + "] " + "is not mail activation. Please confirm mail activation.");
     }
     else if(userData.session == Status.PASSIVE){
          throw new Error("user" + " [" + userData.userName + "] " + "is not active. Please contact your support.");
     }
     else if(userData.isBlocked == Status.ACTIVE){
          throw new Error("user" + " [" + userData.userName + "] " + "is blocked. Please contact your support");
     }
     return true;
}

export default Login;