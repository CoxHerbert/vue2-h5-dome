import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@store/auth';
import { setTitle } from './set-title';

const whiteList = ['/login'];

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@pages/Home.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@pages/Login.vue'),
    meta: { title: '登录', requiresAuth: false },
  },
  {
    path: '/protected',
    name: 'protected',
    component: () => import('@pages/Protected.vue'),
    meta: { title: '受保护', perm: 'demo:view' },
  },
  {
    path: '/recruit',
    name: 'recruit',
    children: [
      {
        path: 'campus',
        name: 'recruit-campus',
        children: [
          {
            path: 'list', // 校招岗位列表
            name: 'recruit-campus-list',
            meta: { title: '校招岗位列表', requiresAuth: false },
            component: () => import('@pages/recruit/campus/list.vue'),
          },
          {
            path: 'apply', // 校招投递表单
            name: 'recruit-campus-apply',
            meta: { title: '校招投递表单', requiresAuth: false },
            component: () => import('@pages/recruit/campus/apply.vue'),
          },
        ],
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  setTitle(to.meta?.title);
  const auth = useAuthStore();

  if (whiteList.includes(to.path)) {
    if (auth.isAuthed && to.path === '/login') return next(from.fullPath || '/');
    return next();
  }

  if (to.meta?.requiresAuth && !auth.isAuthed) {
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }

  // 基于权限的路由按钮控制
  const need = to.meta?.perm;
  if (need && !auth.hasPerm(need)) {
    return next('/');
  }

  next();
});

export default router;
