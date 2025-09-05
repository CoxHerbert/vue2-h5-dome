// src/store/user.js
import { defineStore } from 'pinia';
import Api from '@/api';
import { secureStorage } from '@/utils/secure-storage';
import { KEYS } from '@/constants/keys';
import { normalizeUser } from '@/utils/normalize-user';

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: secureStorage.get(KEYS.USER_INFO, null),
  }),

  actions: {
    setUserInfo(info) {
      this.userInfo = info;
      if (info) secureStorage.set(KEYS.USER_INFO, info);
      else secureStorage.remove(KEYS.USER_INFO);
    },

    reset() {
      this.setUserInfo(null);
    },

    // 拉取接口：你的返回是 { code, success, data, msg }
    async fetchUserInfo() {
      const res = await Api.user.getUserInfo();
      const raw = res?.data?.data || res?.data || {};
      const normalized = normalizeUser(raw || {});
      this.setUserInfo(normalized);
      return normalized;
    },
  },
});
