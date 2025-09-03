import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always', // 允许 <img /> 这种写法
            normal: 'never',
            component: 'always',
          },
        },
      ],
    },
  },
];
