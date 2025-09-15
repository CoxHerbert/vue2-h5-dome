import { createRouter, createWebHistory } from 'vue-router';
import loginModule from './modules/login';
import recruitModule from './modules/recruit';

import homeModule from './modules/home';
import tasksModule from './modules/tasks';
import meModule from './modules/me';

const routes = [
  loginModule,
  recruitModule,
  {
    path: '/',
    component: () => import('@/layouts/TabLayout.vue'),
    redirect: '/home',
    children: [homeModule, tasksModule, meModule],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFound.vue'),
    meta: { title: '404 - 页面不存在' },
  },
  // { path: '/:pathMatch(.*)*', redirect: '/home' },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
