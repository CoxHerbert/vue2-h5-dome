// router/guard.js（新建文件，或直接写在 index.js 里也行）
import { useAuthStore } from '@/store/auth';

const WHITE_LIST = ['/login', '/login/account', '/login/social'];

export function setupRouterGuard(router) {
  router.beforeEach((to, from, next) => {
    const auth = useAuthStore();
    if (to?.meta?.requiresAuth === false) {
      return next();
    }
    // 未登录：只放行白名单，否则去账号登录页，并带回跳
    if (!auth.isLogin) {
      if (WHITE_LIST.includes(to.path)) return next();
      return next({ path: '/login/account', query: { redirect: to.fullPath } });
    }

    // 已登录：不允许停留在登录相关页面，直接去首页
    if (to.path === '/login' || to.path.startsWith('/login/')) {
      return next({ path: '/home' });
    }

    next();
  });
}
