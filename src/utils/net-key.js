// 根据方法/URL/参数生成请求去重 Key
export function buildNetKey(config) {
  const { method = 'get', url = '', params, data } = config;
  const p = params ? JSON.stringify(params) : '';
  const d = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : '';
  return [method.toUpperCase(), url, p, d].join('|');
}
