// src/utils/request.js
import axios from 'axios';
import router from '@/router/index';
import { serialize, tansParams } from '@/utils/util';
import { getToken, removeToken, removeRefreshToken } from '@/utils/auth';
import { isURL, validatenull } from '@/utils/validate';
import website from '@/config/website';
import NProgress from 'nprogress';
import { Base64 } from 'js-base64';
import { baseUrl } from '@/config/env';
import crypto from '@/utils/crypto';
import { showToast } from 'vant';
// ★ 新增：接入 Pinia 鉴权
import { useAuthStore } from '@/store/auth';

// 统一错误提示（遵守 noErrorMsg）
function toastError(message, cfg) {
  if (cfg?.noErrorMsg) return;
  showToast({ message: message || '系统错误', type: 'fail', duration: 20000 });
}

// 不拼接 baseUrl 的白名单前缀
const noBaseUrlPrefixList = ['/pdf-printing'];

// 全局未授权错误提示状态，只提示一次
let isErrorShown = false;

axios.defaults.timeout = 300000;
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status <= 500;
};
axios.defaults.withCredentials = true;

// NProgress 配置
NProgress.configure({ showSpinner: false });

// ============== request 拦截 ==============
axios.interceptors.request.use(
  (config) => {
    NProgress.start();
    isErrorShown = false;

    // 地址为未完全配置状态则加 baseUrl
    if (
      !isURL(config.url) &&
      !config.url.startsWith(baseUrl) &&
      !noBaseUrlPrefixList.some((prefix) => config.url.startsWith(prefix))
    ) {
      config.url = baseUrl + config.url;
    } else {
      config.url = config.url;
    }

    // 扁平化 params 到 url 上
    if (config?.params) {
      const separator = config.url.includes('?') ? '&' : '?';
      config.url += separator + tansParams(config.params);
      delete config.params;
    }

    // 安全请求 header
    config.headers['Blade-Requested-With'] = 'BladeHttpRequest';

    // 是否附带 Basic
    const authorization = config.authorization === false;
    if (!authorization) {
      config.headers['Authorization'] = `Basic ${Base64.encode(
        `${website.clientId}:${website.clientSecret}`
      )}`;
    }
    const isProd = ['test', 'production'].includes(import.meta.env.VITE_APP_ENV);
    if (!isProd) {
      config.headers['X-Dev-ID'] = '6176';
    }

    // Token 注入（尊重 meta.isToken === false 与 cryptoToken）
    const meta = config.meta || {};
    const isToken = meta.isToken === false;
    //headers传递token是否加密
    const cryptoToken = config.cryptoToken === true;
    const token = getToken();
    if (token && !isToken) {
      config.headers[website.tokenHeader] = cryptoToken
        ? 'crypto ' + crypto.encryptAES(token, crypto.cryptoKey)
        : 'bearer ' + token;
    }

    // 报文加密
    const cryptoData = config.cryptoData === true;
    if (cryptoData) {
      if (config.params) {
        const data = crypto.encryptAES(JSON.stringify(config.params), crypto.aesKey);
        config.params = { data };
      }
      if (config.data) {
        config.text = true;
        config.data = crypto.encryptAES(JSON.stringify(config.data), crypto.aesKey);
      }
    }

    // text/plain
    if (config.text === true) {
      config.headers['Content-Type'] = 'text/plain';
    }

    // form 序列化
    if (config.method === 'post' && meta.isSerialize === true) {
      config.data = serialize(config.data);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============== response 拦截（含自动刷新&重试） ==============
axios.interceptors.response.use(
  async (res) => {
    NProgress.done();

    const status = res.data.error_code || res.data.code || res.status;
    const statusWhiteList = website.statusWhiteList || [];
    const message = res.data.msg || res.data.error_description || '系统错误';
    const config = res.config;
    const cryptoData = config.cryptoData === true;

    // 白名单状态码：交给业务自行 catch
    if (statusWhiteList.includes(status)) return Promise.reject(res);

    // ---------- 401 处理：自动 refresh & 重试 ----------
    if (status === 401) {
      // 避免无限循环：同一请求只重试一次
      if (!config._retried) {
        config._retried = true;
        try {
          const auth = useAuthStore(); // ★ Pinia
          // 调用 Pinia 的 refresh（内部完成 setTokenPair）
          await auth.refresh();
          // 刷新后直接重试原请求（request 拦截器会自动带上新 token）
          return axios(config);
        } catch (e) {
          // 刷新失败 → 统一登出
          if (!isErrorShown) {
            isErrorShown = true;
            toastError('用户令牌过期，请重新登录', res.config);
          }
          const auth = useAuthStore();
          auth.logout?.(); // 清理 Pinia & Cookies
          removeToken();
          removeRefreshToken();
          router.push({ path: '/login', query: { redirect: location.hash?.slice(1) || '/' } });
          return Promise.reject(new Error(message));
        }
      }

      // 已重试过仍 401：直接登出
      if (!isErrorShown) {
        isErrorShown = true;
        toastError('用户令牌过期，请重新登录', res.config);
      }
      const auth = useAuthStore();
      auth.logout?.();
      removeToken();
      removeRefreshToken();
      router.push({ path: '/login', query: { redirect: location.hash?.slice(1) || '/' } });
      return Promise.reject(new Error(message));
    }

    // ---------- oauth2 错误：>2000 且带 error_description ----------
    if (status > 2000 && !validatenull(res.data.error_description)) {
      if (!isErrorShown) {
        isErrorShown = true;
        toastError(message, res.config);
      }
      return Promise.reject(new Error(message));
    }

    // ---------- 非 200：统一错误 ----------
    if (status !== 200) {
      toastError(message, res.config);
      return Promise.reject(new Error(message));
    }

    // ---------- 解密响应体 ----------
    if (cryptoData) {
      res.data = JSON.parse(crypto.decryptAES(res.data, crypto.aesKey));
    }

    return res;
  },
  (error) => {
    NProgress.done();
    // 网络层错误或超时
    toastError(error?.message || '网络异常');
    return Promise.reject(new Error(error));
  }
);

export default axios;
