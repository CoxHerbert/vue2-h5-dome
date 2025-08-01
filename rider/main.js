import Vue from 'vue';
import App from './App';
import store from '@/store';

Vue.config.productionTip = false;
App.mpType = 'app';

import wfUI from './components/wf-ui';
Vue.use(wfUI);

import './components/dc/index';

// #ifdef H5
// 小程序不支持动态组件
import WfCustomFields from './pages/plugin/workflow/components/custom-fileds/index.js';
Vue.use(WfCustomFields);
// #endif

// 引入全局uView
import uView from 'uview-ui';
Vue.use(uView);

// 引入vuex
// const vuexStore = require('@/store/$u.mixin.js');
// Vue.mixin(vuexStore);

// 创建对象
const app = new Vue({
    store,
    ...App,
});

// 接口集中管理
import httpInstall from '@/http/install.js';
Vue.use(httpInstall, app);

import http from '@/http/api.js';
Vue.prototype.$http = http;

// 公共函数
import globalFunc from '@/utils/func.js';
Vue.use(globalFunc, app);

app.$mount();
