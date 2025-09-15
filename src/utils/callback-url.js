// src/utils/callback-url.js
// 读取并解码 callbackUrl（默认 key = 'callbackUrl'）
export function readCallbackUrlFromRoute(route, key = 'callbackUrl') {
  if (!route) return null;
  let raw = route.query?.[key] ?? route.params?.[key];

  // vue-router 在多值 query 下可能是数组
  if (Array.isArray(raw)) raw = raw[0];
  if (raw == null) return null;

  try {
    return decodeURIComponent(String(raw));
  } catch {
    return String(raw);
  }
}

// 兜底：直接从 location 解析（无 route 场景、或手写 URL）
export function readCallbackUrlFromLocation(key = 'callbackUrl') {
  if (typeof window === 'undefined') return null;

  // 先查 search，如：/path?callbackUrl=...
  const s1 = new URLSearchParams(window.location.search).get(key);
  if (s1) {
    try {
      return decodeURIComponent(s1);
    } catch {
      return s1;
    }
  }

  // 再查 hash 的 query，如：/#/path?callbackUrl=...
  const hash = window.location.hash || '';
  const qIndex = hash.indexOf('?');
  if (qIndex >= 0) {
    const s2 = new URLSearchParams(hash.slice(qIndex + 1)).get(key);
    if (s2) {
      try {
        return decodeURIComponent(s2);
      } catch {
        return s2;
      }
    }
  }
  return null;
}

// 统一入口：优先用 route，其次用 location
export function getCallbackUrl(route, key = 'callbackUrl') {
  return readCallbackUrlFromRoute(route, key) ?? readCallbackUrlFromLocation(key);
}

// 可选：安全校验，避免开放重定向漏洞
// 允许相对路径，或与当前同源的绝对地址；其它外域请按需白名单
export function isSafeRedirect(url) {
  if (!url) return false;
  // 相对路径直接允许
  if (/^[/#?]/.test(url)) return true;

  try {
    const target = new URL(url, window.location.origin);
    return target.origin === window.location.origin;
  } catch {
    // 非法 URL，当作相对路径处理
    return true;
  }
}
