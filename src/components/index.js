import dcUiComponents from './dc-ui';
import LanguageSelector from './LanguageSelector.vue';
import ScrollAwareNavBar from './ScrollAwareNavBar.vue';

export function registerComponents(app) {
  Object.entries(dcUiComponents).forEach(([name, component]) => {
    app.component(name, component);
  });

  app.component('LanguageSelector', LanguageSelector);
  app.component('ScrollAwareNavBar', ScrollAwareNavBar);
}
