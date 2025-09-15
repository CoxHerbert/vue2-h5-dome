// src/permission.js
import router from './router';
import { useAuthStore } from '@/store/auth';
import NProgress from 'nprogress';
import { setTitle } from '@/utils/set-title';

// ✅ 与 axios 401 拦截器共享的一套工具
import {
  INTENDED_URL_KEY,
  isLoginPath,
  resolveTypeByPath,
  getIntendedFullPathForGuard,
} from '@/router/auth-helpers';

NProgress.configure({ showSpinner: false });

/** 无需登录可访问的路由（不要把 /login 放进来，否则已登录用户会停留在登录页） */
const publicviews = new Set(['/404', '/about']);

/** URL token 白名单（SSO 回跳等） */
const urlTokenWhiteList = new Set(['/sso/callback', '/magic-login']);

/** 是否公开页面 */
const isPublic = (path) => publicviews.has(path);

/** 写 token（兼容老逻辑的“慢写入”场景） */
const syncSetToken = (token) =>
  new Promise((resolve) => {
    if (token) {
      const auth = useAuthStore();
      auth.setTokenPair?.({ accessToken: token });
    }
    setTimeout(resolve, 150);
  });

router.beforeEach(async (to, from, next) => {
  if (!(to.path === '/login' || to.path.startsWith('/login/'))) {
    const full = to.fullPath || location.pathname + location.search + location.hash;
    sessionStorage.setItem('INTENDED_URL', full || '/');
  }

  // ⭐ 记录“期望回跳页”，供 axios 401 拦截器兜底使用
  if (!isLoginPath(to.path)) {
    const full =
      to.fullPath || window.location.pathname + window.location.search + window.location.hash;
    sessionStorage.setItem(INTENDED_URL_KEY, full || '/');
  }

  NProgress.start();
  setTitle(to.meta?.title);

  const auth = useAuthStore();
  const token = auth.token;

  // 1) URL token 白名单：写入后直接放行
  if (urlTokenWhiteList.has(to.path)) {
    if (to.query?.token) {
      await syncSetToken(to.query.token);
    }
    NProgress.done();
    return next();
  }

  // 2) 显式公开页面
  const noAuth = to.meta?.requiresAuth === false || isPublic(to.path);
  if (noAuth) {
    NProgress.done();
    return next();
  }

  // 3) 需要鉴权但未登录 ⇒ 静默 or 普通登录
  if (!token) {
    // 避免已经在登录页时再次重定向导致循环
    if (!isLoginPath(to.path)) {
      const detectedType = resolveTypeByPath(to.path); // 统一“类型匹配”
      const redirectFull = getIntendedFullPathForGuard(to, from); // 统一“回跳计算”（to 是 /login* 时优先用 from）
      NProgress.done();

      if (detectedType) {
        // 命中类型（如 /recruit/campus/*）→ 静默登录
        return next({
          path: '/login/social',
          query: { type: detectedType, redirect: redirectFull },
          replace: true,
        });
      }
      // 其它 → 账号密码登录（/login 的函数重定向会把 query 透传到 /login/account）
      return next({ path: '/login', query: { redirect: redirectFull } });
    }
    NProgress.done();
    return next();
  }

  // 4) 已登录访问 /login* ⇒ 回首页（避免登录页死循环）
  if (isLoginPath(to.path)) {
    NProgress.done();
    return next('/');
  }

  // 5) 正常放行
  NProgress.done();
  next();
});

router.afterEach(() => NProgress.done());
router.onError(() => NProgress.done());
