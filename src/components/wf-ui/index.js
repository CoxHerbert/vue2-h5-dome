import { validateNull, validData, deepClone, findObject } from './util/index.js';
import { registerVantAdapters } from './adapter/registerVantAdapters.js';

const prototypes = {
    validateNull,
    validData,
    deepClone,
    findObject,
    wfImage: 'https://oss.nutflow.vip/rider',
};

export default {
    install(app) {
        const target = app?.config?.globalProperties ?? app.prototype;
        Object.keys(prototypes).forEach((key) => {
            target[key] = prototypes[key];
        });
        registerVantAdapters(app);
    },
    author: 'SSC',
    version: '1.4.0',
};
