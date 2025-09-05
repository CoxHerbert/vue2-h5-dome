// src/store/auth.js
import { defineStore } from 'pinia';
import axios from 'axios';
import {
  getToken,
  setToken,
  removeToken,
  getRefreshToken,
  setRefreshToken,
  removeRefreshToken,
} from '@/utils/auth';
import Api from '@/api'; // ⬅️ 按你的项目实际导入方式调整
import { encrypt } from '@/utils/sm2';

// 刷新接口示例（按你的后端修改）
async function apiRefreshToken(refreshToken) {
  const { data } = await axios.post('/api/auth/refresh', { refreshToken });
  return data;
}

// 小工具：把逗号分隔的字符串转数组
const csv = (s) =>
  s
    ? String(s)
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    : [];

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getToken() || null,
    refreshToken: getRefreshToken() || null,
    userInfo: null,
    _refreshingPromise: null, // 单例刷新保护
  }),

  getters: {
    isLogin: (s) => !!s.token,
  },

  actions: {
    /** 设置 token / refreshToken */
    setTokenPair({ accessToken, refreshToken }) {
      if (accessToken) {
        this.token = accessToken;
        setToken(accessToken); // 写入 cookie
      }
      if (refreshToken) {
        this.refreshToken = refreshToken;
        setRefreshToken(refreshToken); // 写入 cookie
      }
    },

    /** 清除 token */
    clearToken() {
      this.token = null;
      removeToken();
    },

    /** 清除 refreshToken */
    clearRefreshToken() {
      this.refreshToken = null;
      removeRefreshToken();
    },

    /** 设置用户信息 */
    setUserInfo(info) {
      this.userInfo = info;
    },

    /** 退出登录 */
    logout() {
      this.clearToken();
      this.clearRefreshToken();
      this.userInfo = null;
      this._refreshingPromise = null;
    },

    /**
     * 登录（用户名/密码）
     * @param {Object} userInfo - 传给 Api.auth.loginByUsername 的表单体
     * @returns {Object} 用户实体（已规范化部分字段）
     */
    async loginByUsername(userInfo) {
      // 调你的登录接口（已在 axios 拦截器里处理了状态码）
      const a = encrypt(userInfo.password);
      const res = await Api.auth.loginByUsername(
        userInfo.tenantId,
        userInfo.deptId,
        userInfo.roleId,
        userInfo.username,
        a,
        userInfo.type,
        userInfo.key,
        userInfo.code
      );
      const payload = res?.data || {};

      // 拿到 token/rt/expires 等字段（字段名来自你给的示例）
      const accessToken = payload.access_token;
      const refreshToken = payload.refresh_token;
      const tokenType = (payload.token_type || 'bearer').toLowerCase();
      const expiresIn = payload.expires_in; // 秒（如果你要用到，可以在 cookie 上设置过期）

      // 写入 token
      this.setTokenPair({ accessToken, refreshToken });

      // 规范化用户信息，保留原始字段并补充一些便于前端使用的派生字段
      const normalizedUser = {
        ...payload,
        // 常用别名/派生
        tenantId: payload.tenant_id,
        userId: payload.user_id,
        deptId: payload.dept_id,
        postIds: csv(payload.post_id),
        roleIds: csv(payload.role_id),
        roleNames: csv(payload.role_name),
        account: payload.account,
        username: payload.user_name,
        nickName: payload.nick_name,
        realName: payload.real_name,
        avatar: payload.avatar,
        tokenType,
        expiresIn,
      };

      this.setUserInfo(normalizedUser);
      return normalizedUser;
    },

    /**
     * 刷新 accessToken（并发保护）
     */
    async refresh() {
      if (this._refreshingPromise) {
        await this._refreshingPromise;
        return this.token;
      }
      if (!this.refreshToken) {
        this.logout();
        throw new Error('No refresh token');
      }

      this._refreshingPromise = (async () => {
        try {
          const data = await apiRefreshToken(this.refreshToken);
          const accessToken = data.accessToken || data.token || data.access_token;
          const newRefreshToken = data.refreshToken || data.refresh_token || this.refreshToken;
          this.setTokenPair({ accessToken, refreshToken: newRefreshToken });
        } catch (err) {
          this.logout();
          throw err;
        } finally {
          this._refreshingPromise = null;
        }
      })();

      await this._refreshingPromise;
      return this.token;
    },

    /**
     * 确保拿到可用的 token（此实现里交由 401 拦截器刷新即可）
     */
    async ensureFreshToken() {
      if (!this.token) return null;
      try {
        // 如果你希望在请求前就刷新，可以在这里判断是否快过期再 refresh
        return this.token;
      } catch {
        return null;
      }
    },
  },
});
