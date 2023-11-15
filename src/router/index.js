import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        component: () => import('@/views/index'),
        name: 'index',
        redirect: '/home',
        children: [
            {
                path: 'home',
                meta: { title: '首页' },
                component: () => import('@/views/home'),
            },
            {
                path: 'apply',
                meta: { title: '待授权' },
                component: () => import('@/views/apply'),
            },
            {
                path: 'mine',
                meta: { title: '个人中心' },
                component: () => import('@/views/mine'),
            },
        ],
    },
];
const router = new VueRouter({
    mode: 'history',
    routes,
});

export default router;
