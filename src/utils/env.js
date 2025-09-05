// src/utils/env.js
/**
 * 运行环境探测（基于 UA）
 */
export function isWeCom() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /wxwork/i.test(ua) || /WeCom/i.test(ua);
}

export function isWeChat() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  // 企业微信也包含 MicroMessenger，需排除
  return /MicroMessenger/i.test(ua) && !isWeCom();
}

export function isMobile() {
  if (typeof navigator === 'undefined') return false;
  return /Mobile|Android|iP(ad|hone|od)/i.test(navigator.userAgent || '');
}

export function getLoginEnv() {
  if (isWeCom()) return 'wecom';
  if (isWeChat()) return 'wechat';
  return 'h5';
}
