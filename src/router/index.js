import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        component: () => import('@/views/index'),
        name: 'index',
        children: [
            {
                path: 'home',
                meta: { title: '流量充值' },
            },
            {
                path: 'apply',
                meta: { title: '待授权' },
            },
            {
                path: 'mine',
                meta: { title: '个人中心' },
            },
        ],
    },
];
const router = new VueRouter({
    mode: 'history',
    routes,
});

export default router;
