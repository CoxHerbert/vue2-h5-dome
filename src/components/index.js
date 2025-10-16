import Dict from './Dict.vue';
import LanguageSelector from './LanguageSelector.vue';
import RecruitForm from './RecruitForm.vue';
import ScrollAwareNavBar from './ScrollAwareNavBar.vue';
import Uploader from './Uploader.vue';

export function registerComponents(app) {
  app.component('Uploader', Uploader);
  app.component('RecruitForm', RecruitForm);
  app.component('Dict', Dict);
  app.component('LanguageSelector', LanguageSelector);
  app.component('ScrollAwareNavBar', ScrollAwareNavBar);
}
