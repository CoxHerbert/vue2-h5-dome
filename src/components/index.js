import Dict from './dc-ui/Dict.vue';
import LanguageSelector from './LanguageSelector.vue';
import RecruitForm from './dc-ui/RecruitForm.vue';
import ScrollAwareNavBar from './ScrollAwareNavBar.vue';
import Uploader from './dc-ui/Uploader.vue';
import DcPagination from './dc-ui/DcPagination.vue';

export function registerComponents(app) {
  app.component('Uploader', Uploader);
  app.component('RecruitForm', RecruitForm);
  app.component('Dict', Dict);
  app.component('LanguageSelector', LanguageSelector);
  app.component('ScrollAwareNavBar', ScrollAwareNavBar);
  app.component('DcPagination', DcPagination);
}
