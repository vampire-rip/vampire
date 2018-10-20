module.exports = {
  "extends": [
    "standard",
    "plugin:vue/essential"
  ],
  "parserOptions": {
    "parser": "babel-eslint",
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": ["error", { "vars": "all", "args": "after-used", "varsIgnorePattern": "^[A-Z]" }]
  }
};
