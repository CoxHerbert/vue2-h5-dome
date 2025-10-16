// src/router/auth-helpers.js
export const INTENDED_URL_KEY = 'INTENDED_URL';
export const isLoginPath = (p = '') => p === '/login' || p.startsWith('/login/');

// —— 统一“类型匹配表”（只维护这里）——
export const TYPE_MATCHERS = [
  { prefix: '/recruit/campus/apply', type: 'campus_applicant' },
  { prefix: '/recruit/campus', type: 'campus_applicant' }, // 覆盖整个校招区
  // { prefix: '/recruit/internal',  type: 'internal_referral' },
  // { prefix: '/vendor/hr',         type: 'vendor_hr' },
];

export function resolveTypeByPath(path = '') {
  const m = TYPE_MATCHERS.find((m) => path === m.prefix || path.startsWith(m.prefix));
  return m ? m.type : null;
}

export function normalizeFullPath(loc) {
  if (loc?.fullPath) return loc.fullPath;
  try {
    const p = window.location.pathname + window.location.search + window.location.hash;
    return p || '/';
  } catch {
    return '/';
  }
}

// 守卫用：to 已是 /login* 时优先用 from 还原原始目标
export function getIntendedFullPathForGuard(to, from) {
  if (isLoginPath(to?.path) && from && !isLoginPath(from?.path)) {
    console.log(normalizeFullPath(from));

    return normalizeFullPath(from);
  }
  let p = to?.fullPath || '';
  if (!p || p === '/' || isLoginPath(p)) p = normalizeFullPath(to);
  if (isLoginPath(p)) p = '/';
  return p;
}

// axios 用：在无 to/from 场景，尽量还原“原始目标页”
export function getIntendedFullPathForAxios(router) {
  const cur = router?.currentRoute?.value;
  const qRedirect = cur?.query?.redirect;
  if (qRedirect) return String(qRedirect);

  const saved = sessionStorage.getItem(INTENDED_URL_KEY);
  if (saved) return saved;

  const curFull = normalizeFullPath(cur);
  if (!isLoginPath(cur?.path) && !isLoginPath(curFull)) return curFull;

  return '/';
}

// 公共：保存意图页（页面/守卫都可以用）
export function saveIntended(fullPath) {
  if (!fullPath) return;
  sessionStorage.setItem(INTENDED_URL_KEY, fullPath);
}
