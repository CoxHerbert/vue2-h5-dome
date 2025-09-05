// src/plugins/index.js
import { createPinia } from 'pinia';
import { createDictPlugin } from './dict-plugin';
import vant from 'vant';
import router from '@/router';

export async function setupPlugins(app) {
  app.use(createPinia());
  app.use(vant);
  app.use(router);
  app.use(createDictPlugin()); // 依赖 useDictStore
}

export default { install: (app) => setupPlugins(app) };
