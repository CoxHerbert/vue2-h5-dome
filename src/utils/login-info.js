// src/utils/login-info.js
const isObject = (val) => val && typeof val === 'object' && !Array.isArray(val);

export function extractLoginInfo(payload) {
  const candidates = [
    payload?.login_info,
    payload?.loginInfo,
    payload?.data?.login_info,
    payload?.data?.loginInfo,
  ];

  return candidates.find((info) => isObject(info)) || null;
}
