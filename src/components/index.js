import { Dict, RecruitForm, Uploader, DcPagination } from './dc-ui';
import LanguageSelector from './LanguageSelector.vue';
import ScrollAwareNavBar from './ScrollAwareNavBar.vue';

export function registerComponents(app) {
  const dcUiComponents = {
    'dc-dict': Dict,
    'dc-recruit-form': RecruitForm,
    'dc-uploader': Uploader,
    'dc-pagination': DcPagination,
  };

  Object.entries(dcUiComponents).forEach(([name, component]) => {
    app.component(name, component);
  });

  app.component('LanguageSelector', LanguageSelector);
  app.component('ScrollAwareNavBar', ScrollAwareNavBar);
}
