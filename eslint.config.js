// eslint.config.js
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  { ignores: ['node_modules/**', 'dist/**', '.vite/**', 'coverage/**', '*.min.js'] },

  {
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2021 },
    },
  },

  ...pluginVue.configs['flat/recommended'],
  eslintConfigPrettier,

  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'log', 'info', 'table'] }],
      'no-debugger': 'warn',

      // 👇 新增：下划线开头的变量/参数/捕获错误不算“未使用”
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/html-self-closing': [
        'error',
        { html: { void: 'always', normal: 'never', component: 'always' } },
      ],

      'no-restricted-properties': [
        'error',
        {
          object: 'this',
          property: '$set',
          message:
            'Vue 3 移除了 this.$set，请直接给响应式对象赋值（例如：this[key] = value）。',
        },
        {
          object: 'this',
          property: '$delete',
          message: 'Vue 3 移除了 this.$delete，请改用 delete 运算符。',
        },
        {
          object: 'Vue',
          property: 'set',
          message: 'Vue 3 移除了 Vue.set，请直接修改响应式数据。',
        },
        {
          object: 'Vue',
          property: 'delete',
          message: 'Vue 3 移除了 Vue.delete，请使用 delete 运算符。',
        },
      ],
    },
  },

  {
    files: ['vite.config.*', '*.config.*', 'scripts/**/*.*'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      'no-undef': 'off',
      'no-console': ['warn', { allow: ['warn', 'error', 'log', 'info'] }],
    },
  },
];
