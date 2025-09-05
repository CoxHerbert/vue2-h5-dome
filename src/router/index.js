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
  { path: '/:pathMatch(.*)*', redirect: '/home' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
