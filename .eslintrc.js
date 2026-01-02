module.exports = {
  root: true,

  env: {
    node: true,
    browser: true,
    es2021: true
  },

  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },

  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential'
  ],

  rules: {
    // Vue 3 마이그레이션 중 필수
    'vue/multi-word-component-names': 'off',
    'vue/no-useless-template-attributes': 'off'
  }
}
