// import dcUiComponents from './dc-ui';
import LanguageSelector from './LanguageSelector.vue';
import ScrollAwareNavBar from './ScrollAwareNavBar.vue';

export function registerComponents(app) {
  app.component('LanguageSelector', LanguageSelector);
  app.component('ScrollAwareNavBar', ScrollAwareNavBar);
}
