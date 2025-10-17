import { Dict, RecruitForm, Uploader, DcPagination } from './dc-ui';
import LanguageSelector from './LanguageSelector.vue';
import ScrollAwareNavBar from './ScrollAwareNavBar.vue';

export function registerComponents(app) {
  app.component('Uploader', Uploader);
  app.component('RecruitForm', RecruitForm);
  app.component('Dict', Dict);
  app.component('LanguageSelector', LanguageSelector);
  app.component('ScrollAwareNavBar', ScrollAwareNavBar);
  app.component('DcPagination', DcPagination);
}
