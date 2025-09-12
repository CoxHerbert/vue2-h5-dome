// src/utils/env.js
function getUA(ua) {
  if (ua) return String(ua);
  if (typeof navigator === 'undefined') return '';
  return navigator.userAgent || '';
}

export function isWeCom(ua) {
  return /(wxwork|WeCom)/i.test(getUA(ua));
}

export function isWeChat(ua) {
  const u = getUA(ua);
  // 识别微信但排除企业微信
  return /MicroMessenger/i.test(u) && !isWeCom(u);
}

/**
 * 同步环境识别
 * 返回值：'wechat_enterprise' | 'wechat_open' | 'h5'
 */
export function getLoginEnv(ua) {
  if (isWeCom(ua)) return 'wechat_enterprise';
  if (isWeChat(ua)) return 'wechat_open';
  return 'h5';
}

// 若项目里曾用过 getLoginEnvSync，这里做个别名兼容
export const getLoginEnvSync = getLoginEnv;
