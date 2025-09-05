import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import 'nprogress/nprogress.css';

// 👇 引入并使用插件
import './plugins/index';
// Vant (按需样式由 Vite plugin 或手动引入，这里简单全局样式引入）
import 'vant/lib/index.css';
// 全局样式
import '@/styles/index.scss';

import { setupDirectives } from './directives';
import { attachNProgress } from './router/nprogress';
import { setupPlugins } from '@/plugins';

const app = createApp(App);
app.use(createPinia());
app.use(GlobalComponents);
setupDirectives(app);
attachNProgress(router);
await setupPlugins(app);

import './permission.js';

app.mount('#app');
