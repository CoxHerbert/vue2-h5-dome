// src/plugins/index.js
import { createDictPlugin } from './dict-plugin';

export async function setupPlugins(app) {
  app.use(createDictPlugin()); // 依赖 useDictStore
}

export default { install: (app) => setupPlugins(app) };
