import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import 'nprogress/nprogress.css';

// 👇 引入并使用插件
import createGlobalComponents from './plugins/global-components';

// 示例：立即加载、PascalCase、添加前缀 'Dc'
const GlobalComponents = createGlobalComponents({
  // prefix: 'Dc',
  mode: 'eager', // 或 'lazy'
  caseStyle: 'pascal',
  // include: /\/components\//,
  // exclude: /\/_private\//,
  // alias: { 'index': 'UploadDialog' },
});

// Vant (按需样式由 Vite plugin 或手动引入，这里简单全局样式引入）
import 'vant/lib/index.css';
import '@styles/index.scss';
import vant from 'vant';

import { setupDirectives } from './directives';
import { attachNProgress } from './router/nprogress';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(vant);
app.use(GlobalComponents);
setupDirectives(app);
attachNProgress(router);

import './permission.js';

app.mount('#app');
