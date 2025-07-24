import { PocketLib } from "../constants.js";
const { PocketConfigManager, PocketLog, PocketMongo, PocketQueryFilter, PocketService, execute, dbClient, Pocket,PocketToken } = PocketLib;

/**
 * Pocket PocketVerifyMailToken servisi
 * @param {Pocket} criteria
 * @returns {Promise<Array>}
 */
const PocketVerifyMailToken = execute(async (criteria) => {
     try {
          PocketService.parameterMustBeFill(criteria, "token");
          const validatingToken = await PocketToken.verifyToken(criteria.token);

          if(validatingToken && await PocketToken.isTokenExist(validatingToken)){
               const isInvalidate = await PocketToken.invalidateToken(criteria.token);
               if(isInvalidate){
                    let email = validatingToken.email;
                    let username = validatingToken.username;
                    let searchUserRequest = Pocket.create();
                    searchUserRequest.put("email",email);
                    let dbUserResponse = await PocketService.executeService(`UserSearchWithEmail`, "Pocket", searchUserRequest);
                    let user = dbUserResponse?.data;

                    if(user.emailVerified){
                         throw new Error("Email validasyonu zaten aktif edilmiş.")
                    }

                    user.emailVerified = true;
                    await PocketService.executeService(`UserUpdate`, "Pocket", user);
                    return true;

               }
          }

     } catch (error) {
          PocketLog.error(`PocketVerifyMailToken servisinde hata meydana geldi."` + error);
          throw new Error(error.message);
     }
});

export default PocketVerifyMailToken;