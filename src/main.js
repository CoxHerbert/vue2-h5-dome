import Vue from 'vue';
import App from './App.vue';
import router from './router';
import 'default-passive-events';

import './static/style/index.less';

// import 'swiper/swiper.min.css';

Vue.config.productionTip = false;

new Vue({
    router,
    render: (h) => h(App),
}).$mount('#app');
