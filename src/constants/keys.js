// src/constants/keys.js
const STORAGE_PREFIX = 'mobile:h5:';

const withPrefix = (key) => `${STORAGE_PREFIX}${key}`;

export const KEYS = {
  ACCESS_TOKEN: withPrefix('saber3-access-token'),
  REFRESH_TOKEN: withPrefix('saber3-refresh-token'),
  SESSION_ID: withPrefix('JSESSIONID'),
  USER_ID: withPrefix('b-user-id'),
  USER_INFO: withPrefix('app:auth:user_info'), // 加密存储的用户信息
  DEBUG_VCONSOLE_ENABLED: withPrefix('debug:vconsole-enabled'),
  LAST_USERNAME: withPrefix('LAST_USERNAME'),
  LOGIN_INFO: withPrefix('loginInfo'),
  LOCALE_PREFERENCE: withPrefix('app-locale'),
  SOP_API_TOKEN: withPrefix('SOP_API_TOKEN'),
  PERMISSION: withPrefix('PERMISSION'),
  DEPT_INFO: withPrefix('DEPT_INFO'),
};
