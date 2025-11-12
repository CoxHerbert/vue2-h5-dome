import 'vant/lib/index.css';
import { validateNull, validData, deepClone, findObject } from './util/index.js';
import vantComponents from './vant/index.js';

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

        vantComponents.forEach((component) => {
            if (component && component.name) {
                app.component(component.name, component);
            }
        });
    },
    author: 'SSC',
    version: '2.0.0',
};
