// src/permission.js
import router from './router';
import { useAuthStore } from '@store/auth';
import NProgress from 'nprogress';

NProgress.configure({ showSpinner: false });

/** 无需登录可访问的路由 */
const publicPages = new Set(['/login', '/404', '/about']);

/** 允许通过 ?token=xxx 放行（如 SSO 回跳） */
const urlTokenWhiteList = new Set(['/sso/callback', '/magic-login']);

/** 设置 token 并延迟 300ms（保留兼容逻辑） */
const syncSetToken = (token) =>
  new Promise((resolve) => {
    if (token) {
      const auth = useAuthStore();
      auth.setToken?.(token);
    }
    setTimeout(resolve, 300);
  });

/** 是否公开页面 */
const isPublic = (path) => publicPages.has(path);

router.beforeEach(async (to, from, next) => {
  NProgress.start();

  const auth = useAuthStore();
  const token = auth.token;

  // 1) URL token 白名单
  if (urlTokenWhiteList.has(to.path)) {
    if (to.query?.token) await syncSetToken(to.query.token);
    return next();
  }

  // 2) 判断是否需要鉴权
  const noAuth = to.meta?.requiresAuth === false || isPublic(to.path);

  if (noAuth) {
    // 不需要鉴权的页面，直接放行
    return next();
  }

  if (!token) {
    // 需要鉴权但未登录
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }

  // 3) 已登录：target 外开
  if (to.meta?.target) {
    const url = String(to.query?.url || '').replace(/#/g, '&');
    if (url) window.open(url);
    NProgress.done(); // ⭐ 注意这里要手动收尾
    return next(false);
  }

  // 4) 已登录访问 /login ⇒ 回首页
  if (to.path === '/login') return next('/');

  // 5) 正常放行
  next();
});

router.afterEach(() => {
  NProgress.done();
});

router.onError(() => {
  NProgress.done();
});
