// src/router/ensure-auth.js
import router from '@/router';
import { useAuthStore } from '@/store/auth';
import { isLoginPath, resolveTypeByPath, normalizeFullPath, saveIntended } from './auth-helpers';

let _redirecting = false;

/**
 * 页面进入时调用：未登录则根据类型跳到静默/账号登录，并带上 redirect
 * @param {Object} opts
 * @param {string} [opts.type]         - 业务类型（不传则按 path 自动匹配）
 * @param {('social'|'account'|'auto')} [opts.mode='auto'] - 优先登录方式
 * @param {string} [opts.redirect]     - 指定回跳（不传则用当前路由 fullPath）
 * @param {boolean} [opts.replace=true] - 用 replace 跳转，避免历史栈多一页
 * @returns {Promise<boolean>}         - true=已登录可继续；false=已跳转登录
 */
export async function ensureAuthOnEnter(opts = {}) {
  const { type, mode = 'auto', redirect, replace = true } = opts;
  const auth = useAuthStore();
  const cur = router.currentRoute.value;

  // 已在登录页或正在重定向 → 放过，避免循环
  if (_redirecting || isLoginPath(cur?.path)) return !!auth?.token;

  // 已登录 → 记录 intended（可选）后放行
  if (auth?.token) {
    saveIntended(normalizeFullPath(cur));
    return true;
  }

  // 计算类型 & 回跳
  const detectedType = type || resolveTypeByPath(cur?.path);
  const intended = redirect || normalizeFullPath(cur);
  saveIntended(intended); // 保存给 axios 401 等兜底

  // 选择登录方式
  const goSocial = mode === 'social' || (mode === 'auto' && !!detectedType);

  const target = goSocial
    ? { path: '/login/social', query: { type: detectedType || '', redirect: intended } }
    : { path: '/login', query: { redirect: intended } };

  _redirecting = true;
  try {
    if (replace) {
      await router.replace(target);
    } else {
      await router.push(target);
    }
  } finally {
    // 稍后释放，避免并发多次跳转
    setTimeout(() => (_redirecting = false), 150);
  }

  return false;
}

/** 路由级 beforeEnter 复用：factory 写法，传入固定 type/mode */
export function ensureAuthRouteGuard(factoryOpts = {}) {
  return async (to, from, next) => {
    const auth = useAuthStore();

    if (auth?.token) {
      return next();
    }

    // 如果目标是登录页，放过
    if (isLoginPath(to?.path)) return next();

    const type = factoryOpts.type || resolveTypeByPath(to?.path);
    const mode = factoryOpts.mode ?? 'auto';
    const intended =
      to?.fullPath ||
      window.location.pathname + window.location.search + window.location.hash ||
      '/';
    saveIntended(intended);

    const goSocial = mode === 'social' || (mode === 'auto' && !!type);
    const target = goSocial
      ? { path: '/login/social', query: { type: type || '', redirect: intended } }
      : { path: '/login', query: { redirect: intended } };

    // 用 replace 避免历史里多一页
    return next({ ...target, replace: true });
  };
}
