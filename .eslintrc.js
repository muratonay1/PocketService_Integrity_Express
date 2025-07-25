module.exports = {
     env: {
          es6: true,
          node: true
     },
     parserOptions: {
          ecmaVersion: 2021,
          sourceType: "module"
     },
     rules: {
          "require-await": "off",
          "no-console": "warn",
          "semi": ["error", "always"],
          "quotes": ["error", "double"]
     }
};
