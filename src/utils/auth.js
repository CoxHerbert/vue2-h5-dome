const KEY = 'APP_TOKEN';
export function getToken() {
  return localStorage.getItem(KEY) || '';
}
export function setToken(v) {
  localStorage.setItem(KEY, v || '');
}
export function clearToken() {
  localStorage.removeItem(KEY);
}
