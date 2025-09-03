import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    perms: [],
  }),
  getters: {
    isAuthed: (s) => !!s.token,
  },
  actions: {
    login({ username, password }) {
      // 模拟登录
      if (username && password) {
        this.token = 'mock-token';
        this.perms = ['demo:view', 'uploader:use'];
        return true;
      }
      return false;
    },
    logout() {
      this.token = '';
      this.perms = [];
    },
    hasPerm(p) {
      return this.perms.includes(p);
    },
    setToken(token) {
      this.token = token;
    },
  },
});
