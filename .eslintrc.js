module.exports = {
  env: {
    node: true,
    "jest/globals": true,
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "prettier",
    "plugin:jest/recommended",
  ],
  rules: {
    "vue/multi-word-component-names": 0,
  },
  plugins: ["jest"],
};
