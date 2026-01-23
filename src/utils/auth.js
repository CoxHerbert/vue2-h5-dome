import Cookies from 'js-cookie';

import { KEYS } from '@/constants/keys';

export function getToken() {
  return Cookies.get(KEYS.ACCESS_TOKEN);
}

export function setToken(token) {
  return Cookies.set(KEYS.ACCESS_TOKEN, token);
}

export function getRefreshToken() {
  return Cookies.get(KEYS.REFRESH_TOKEN);
}

export function setRefreshToken(token) {
  return Cookies.set(KEYS.REFRESH_TOKEN, token);
}

export function removeToken() {
  Cookies.remove(KEYS.SESSION_ID);
  Cookies.remove(KEYS.USER_ID);
  return Cookies.remove(KEYS.ACCESS_TOKEN);
}

export function removeRefreshToken() {
  return Cookies.remove(KEYS.REFRESH_TOKEN);
}
