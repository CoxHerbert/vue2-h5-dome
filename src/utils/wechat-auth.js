// src/utils/wechat-auth.js
import { getLoginEnv } from './env.js';

// 是否已登录：按你实际改。示例检查 cookie sid 或本地 token
export function hasLogin() {
  const hasSid = document.cookie.includes('sid=');
  const hasToken = !!localStorage.getItem('token');
  return hasSid || hasToken;
}

// 兼容后端返回的多种形态
function pickUrl(res) {
  if (!res) return '';
  if (typeof res === 'string') return res;
  if (res.url) return res.url;
  if (res.data) return typeof res.data === 'string' ? res.data : res.data.url || '';
  return '';
}

// 触发授权（默认静默：scope=base）。可传 envType 给后端（可选）
export async function gotoWechatAuthorize(redirectUrl, { scope = 'base', envType } = {}) {
  const params = { redirectUrl };
  // 若后端支持 scope/type，这两行保留；不支持就删掉
  params.scope = scope; // 'base' -> snsapi_base, 'userinfo' -> snsapi_userinfo
  if (envType) params.type = envType; // 'wechat_open' | 'wechat_enterprise' | 'wechat_open_pc' | ...

  const res = await Api.auth.authorize(params);
  const url = pickUrl(res);
  if (!url) throw new Error('authorize 未返回跳转 URL');
  location.replace(url);
}

// 去掉 code/state（避免污染最终页）
export function stripWxParams(url) {
  try {
    const u = new URL(url, location.origin);
    u.searchParams.delete('code');
    u.searchParams.delete('state');
    return u.toString();
  } catch {
    return url;
  }
}

// 确保静默登录：在可用环境且未登录，则发起 snsapi_base
export async function ensureWechatSilentLogin(backUrl) {
  if (hasLogin()) return;

  // 防循环
  if (sessionStorage.getItem('wx_authing') === '1') return;
  sessionStorage.setItem('wx_authing', '1');

  const env = getLoginEnv();
  const target = backUrl || location.href;

  if (env === 'wechat_open' || env === 'wechat_enterprise') {
    await gotoWechatAuthorize(target, { scope: 'base', envType: env });
    return;
  }
  if (env === 'wechat_open_pc') {
    // PC 微信：后端应返回 qrconnect 链接
    await gotoWechatAuthorize(target, { scope: 'base', envType: env });
    return;
  }
  // 其它（小程序/H5）不在此发起公众号授权；交给各自登录方案
  sessionStorage.removeItem('wx_authing');
}
