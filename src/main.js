import Vue from 'vue';
import App from './App.vue';
import router from './router';
import 'default-passive-events';

import './static/style/index.less';

import "@/utils/swiper/idangerous.swiper.css";

Vue.config.productionTip = false;

new Vue({
    router,
    render: (h) => h(App),
}).$mount('#app');
