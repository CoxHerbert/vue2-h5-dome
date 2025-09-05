import Dict from './Dict.vue';
import RecruitForm from './RecruitForm.vue';
import Uploader from './Uploader.vue';

export function registerComponents(app) {
  app.component('Uploader', Uploader);
  app.component('RecruitForm', RecruitForm);
  app.component('Dict', Dict);
}
