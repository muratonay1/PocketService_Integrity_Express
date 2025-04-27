const jwt = require('jsonwebtoken');
require('dotenv').config();

class PocketToken {
     constructor () {
          this.refreshTokens = new Set();
     }

     static generateAccessToken(user) {
          const payload = {
               sessionId: user.sessionId,
               username: user.username,
               menu: user.menu,
               expiredDate: Date.now() + (15 * 60 * 1000) // 15 dakika
          };

          return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES });
     }

     static generateRefreshToken(user) {
          const payload = {
               sessionId: user.sessionId,
               username: user.username,
               expiredDate: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 gün
          };

          const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES });

          this.refreshTokens.add(refreshToken);
          return refreshToken;
     }

     static verifyAccessToken(token) {
          try {
               return jwt.verify(token, process.env.JWT_SECRET);
          } catch (err) {
               return null;
          }
     }

     static verifyRefreshToken(token) {
          if (!this.refreshTokens.has(token)) return null;
          try {
               return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
          } catch (err) {
               return null;
          }
     }

     static revokeRefreshToken(token) {
          this.refreshTokens.delete(token);
     }

     static isTokenExpired(decodedToken) {
          return decodedToken.exp * 1000 < Date.now();
     }
}

export default PocketToken;
