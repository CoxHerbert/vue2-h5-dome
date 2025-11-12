import LanguageSelector from './LanguageSelector.vue';
import wfUiVant from './wf-ui1.0/vant/index.js';

export function registerComponents(app) {
  app.component('LanguageSelector', LanguageSelector);
  app.use(wfUiVant);
}
