// src/store/user.js
import { defineStore } from 'pinia';
import Api from '@/api';
import { secureStorage } from '@/utils/secure-storage';
import { KEYS } from '@/constants/keys';
import { normalizeUser } from '@/utils/normalize-user';

const isObject = (val) => val && typeof val === 'object' && !Array.isArray(val);

function readLoginInfo() {
  if (typeof window === 'undefined' || !window?.localStorage) return null;
  try {
    const stored = window.localStorage.getItem(KEYS.LOGIN_INFO);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.warn('[user-store] failed to read login info:', err);
    return null;
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: secureStorage.get(KEYS.USER_INFO, null),
    loginInfo: readLoginInfo(),
  }),

  actions: {
    setUserInfo(info) {
      this.userInfo = info;
      if (info) secureStorage.set(KEYS.USER_INFO, info);
      else secureStorage.remove(KEYS.USER_INFO);
    },

    setLoginInfo(info) {
      if (typeof window === 'undefined' || !window?.localStorage) {
        this.loginInfo = info || null;
        return;
      }

      if (isObject(info)) {
        this.loginInfo = info;
        try {
          window.localStorage.setItem(KEYS.LOGIN_INFO, JSON.stringify(info));
        } catch (err) {
          console.warn('[user-store] failed to persist login info:', err);
          try {
            window.localStorage.setItem(KEYS.LOGIN_INFO, String(info));
          } catch {}
        }
      } else {
        this.loginInfo = null;
        try {
          window.localStorage.removeItem(KEYS.LOGIN_INFO);
        } catch (err) {
          console.warn('[user-store] failed to remove login info:', err);
        }
      }
    },

    mergeLoginInfo(loginInfo) {
      if (!isObject(loginInfo)) {
        this.setLoginInfo(null);
        return;
      }

      const mergedLoginInfo = {
        ...(this.loginInfo || {}),
        ...loginInfo,
      };
      this.setLoginInfo(mergedLoginInfo);

      const mergedUser = {
        ...(this.userInfo || {}),
        ...loginInfo,
        dept_name: this.userInfo?.deptNames.toString() || '',
        post_name: this.userInfo?.postNames.toString() || '',
      };

      this.setUserInfo(mergedUser);
    },

    reset() {
      this.setUserInfo(null);
      this.setLoginInfo(null);
    },

    // 拉取接口：你的返回是 { code, success, data, msg }
    async fetchUserInfo() {
      const res = await Api.user.getUserInfo();
      const raw = res?.data?.data || res?.data || {};
      const normalized = normalizeUser(raw || {});
      this.setUserInfo(normalized);
      return normalized;
    },

    async changePassword(payload = {}) {
      const params = {
        oldPassword: payload.oldPassword,
        newPassword: payload.newPassword,
      };

      await Api.user.updatePassword(params);
    },
  },
});
