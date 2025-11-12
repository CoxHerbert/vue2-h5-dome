import { validateNull, validData, deepClone, findObject } from './util/index.js';

const prototypes = {
  validateNull,
  validData,
  deepClone,
  findObject,
  wfImage: 'https://oss.nutflow.vip/rider',
};

export default {
  install(app) {
    Object.entries(prototypes).forEach(([key, value]) => {
      app.config.globalProperties[key] = value;
    });
  },
  author: 'SSC',
  version: '1.4.0',
};
