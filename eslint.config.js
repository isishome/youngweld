import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.tmp/**',
      '.report/**',
      'docs/**',
      'templates/**',
      'playwright-report/**',
      'test-results/**',
      'public/**',
    ],
  },
  js.configs.recommended,
  ...vue.configs['flat/essential'],
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'vue/multi-word-component-names': [
        'error',
        {
          ignores: [
            'App',
            'Main',
            'Company',
            'Product',
            'Support',
            'Location',
            'Layout',
          ],
        },
      ],
    },
  },
  {
    files: ['infra/cloudfront/viewer-request.js'],
    rules: { 'no-unused-vars': ['error', { varsIgnorePattern: '^handler$' }] },
  },
  prettier,
]
