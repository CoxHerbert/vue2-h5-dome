import { createRouter, createWebHistory } from 'vue-router';
import loginModule from './modules/login';
import recruitModule from './modules/recruit';

const routes = [
  loginModule,
  recruitModule,
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/protected',
    name: 'protected',
    component: () => import('@/views/Protected.vue'),
    meta: { title: '受保护', perm: 'demo:view' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
