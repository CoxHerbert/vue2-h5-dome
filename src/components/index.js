import LanguageSelector from './LanguageSelector.vue';
import ScrollAwareNavBar from './ScrollAwareNavBar.vue';
import DcDict from './dc-ui/DcDict.vue';
import DcRecruitForm from './dc-ui/DcRecruitForm.vue';
import DcUploader from './dc-ui/DcUploader.vue';
import DcPagination from './dc-ui/DcPagination.vue';

export function registerComponents(app) {
  app.component('DcUploader', DcUploader);
  app.component('DcRecruitForm', DcRecruitForm);
  app.component('DcDict', DcDict);
  app.component('LanguageSelector', LanguageSelector);
  app.component('ScrollAwareNavBar', ScrollAwareNavBar);
  app.component('DcPagination', DcPagination);
}
