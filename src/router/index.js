import { createRouter, createWebHistory } from 'vue-router';
import loginModule from './modules/login';
import recruitModule from './modules/recruit';

import homeModule from './modules/home';
import appsModule, { appDetailRoutes } from './modules/apps.js';
import meModule from './modules/me';

const routes = [
  loginModule,
  recruitModule,
  ...appDetailRoutes,
  {
    path: '/',
    component: () => import('@/layouts/TabLayout.vue'),
    redirect: '/home',
    children: [homeModule, appsModule, meModule],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFound.vue'),
    meta: { title: '404 - 页面不存在', requiresAuth: false },
  },
  // { path: '/:pathMatch(.*)*', redirect: '/home' },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
