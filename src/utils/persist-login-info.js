// src/utils/persist-login-info.js
import { KEYS } from '@/constants/keys';

function isObject(val) {
  return val && typeof val === 'object' && !Array.isArray(val);
}

export function extractLoginInfo(payload) {
  const candidates = [
    payload?.login_info,
    payload?.loginInfo,
    payload?.data?.login_info,
    payload?.data?.loginInfo,
  ];

  return candidates.find((info) => isObject(info)) || null;
}

export function persistLoginInfo({ payload, userStore, loginInfoOverride } = {}) {
  const loginInfo = loginInfoOverride ?? extractLoginInfo(payload);

  if (!isObject(loginInfo)) {
    try {
      localStorage.removeItem(KEYS.LOGIN_INFO);
    } catch (err) {
      console.warn('[persist-login-info] remove login info failed:', err);
    }
    return null;
  }

  try {
    localStorage.setItem(KEYS.LOGIN_INFO, JSON.stringify(loginInfo));
  } catch (err) {
    console.warn('[persist-login-info] persist login info failed, storing fallback string:', err);
    localStorage.setItem(KEYS.LOGIN_INFO, String(loginInfo));
  }

  userStore?.mergeLoginInfo?.(loginInfo);

  return loginInfo;
}
