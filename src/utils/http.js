import axios from 'axios';
import { showToast } from 'vant';
import { buildNetKey } from './net-key';
import { getToken, setToken, clearToken } from './auth';

const instance = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// 请求去重/取消
const pending = new Map();
function addPending(config) {
  const key = buildNetKey(config);
  if (pending.has(key)) {
    config.cancelToken = pending.get(key).token;
  } else {
    const controller = new AbortController();
    config.signal = controller.signal;
    pending.set(key, controller);
  }
}
function removePending(config) {
  const key = buildNetKey(config);
  const controller = pending.get(key);
  if (controller) {
    pending.delete(key);
  }
}

// 重试 & 退避
async function retryRequest(error) {
  const config = error.config || {};
  config.__retryCount = config.__retryCount || 0;
  const max = config.retry || 0;
  if (config.__retryCount >= max) throw error;
  config.__retryCount += 1;
  const delay = Math.min(1000 * 2 ** config.__retryCount, 8000);
  await new Promise((r) => setTimeout(r, delay));
  return instance(config);
}

// 刷新 Token 队列
let isRefreshing = false;
let queue = [];
function enqueue(cb) {
  queue.push(cb);
}
function flushQueue(token) {
  queue.forEach((cb) => cb(token));
  queue = [];
}

// 请求拦截
instance.interceptors.request.use((cfg) => {
  addPending(cfg);
  const t = getToken();
  if (t) cfg.headers['Authorization'] = `Bearer ${t}`;
  // 幂等键（示例）
  cfg.headers['Idempotency-Key'] =
    cfg.headers['Idempotency-Key'] || crypto.randomUUID?.() || String(Date.now());
  cfg.headers['X-Request-Id'] =
    cfg.headers['X-Request-Id'] || crypto.randomUUID?.() || String(Date.now());
  cfg.metadata = { start: Date.now() };
  return cfg;
}, Promise.reject);

// 响应拦截
instance.interceptors.response.use(
  async (res) => {
    removePending(res.config);
    res.config.metadata.end = Date.now();
    res.config.metadata.duration = res.config.metadata.end - res.config.metadata.start;
    // 示例：错误码字典化（假设后端返回 { code, message }）
    const { data } = res;
    if (data && typeof data.code !== 'undefined' && data.code !== 0) {
      showToast(data.message || '请求失败');
      return Promise.reject(data);
    }
    return data?.data ?? data;
  },
  async (error) => {
    const { response, config } = error;
    removePending(config || {});

    if (response && response.status === 401 && !config.__isRetryAuth) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          // 模拟刷新
          const newToken = 'mock-refreshed-token';
          setToken(newToken);
          flushQueue(newToken);
        } catch (e) {
          clearToken();
          flushQueue(null);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve) => {
        enqueue((token) => {
          if (token) {
            config.__isRetryAuth = true;
            config.headers['Authorization'] = `Bearer ${token}`;
            resolve(instance(config));
          } else {
            showToast('登录已过期');
            resolve(Promise.reject(error));
          }
        });
      });
    }

    if (!response) {
      // 网络超时/断网 → 重试
      if ((config && config.retry) || config?.retry === 0) {
        try {
          return await retryRequest(error);
        } catch (e) {
          /* fallthrough */
        }
      }
      showToast('网络异常，请检查连接');
    } else {
      const code = response.status;
      const dict = {
        400: '请求参数错误',
        403: '没有权限',
        404: '资源不存在',
        500: '服务器错误',
      };
      showToast(dict[code] || `请求失败（${code}）`);
    }
    return Promise.reject(error);
  }
);

export default instance;
