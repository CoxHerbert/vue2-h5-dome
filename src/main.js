import Vue from 'vue';
import App from './App.vue';
import router from './router';
import 'default-passive-events';

// 引入全局的样式文件
import Vant from 'vant';
import 'vant/lib/index.css';
Vue.use(Vant);

import './static/style/index.less';

Vue.config.productionTip = false;

new Vue({
    router,
    render: (h) => h(App),
}).$mount('#app');
