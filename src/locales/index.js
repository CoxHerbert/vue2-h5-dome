import { createI18n } from 'vue-i18n';
import { Locale as VantLocale } from 'vant';
import vantZhCN from 'vant/es/locale/lang/zh-CN';
import vantEnUS from 'vant/es/locale/lang/en-US';
import zhCN from './zh-CN';
import enUS from './en-US';

const defaultLocale = 'zh-CN';
const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

const vantMessages = {
  'zh-CN': vantZhCN,
  'en-US': vantEnUS,
};

const LOCALE_STORAGE_KEY = 'app-locale';

function readStoredLocale() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage?.getItem(LOCALE_STORAGE_KEY);
    if (stored && Object.prototype.hasOwnProperty.call(messages, stored)) {
      return stored;
    }
  } catch (err) {
    // 忽略 storage 读取异常
  }
  return null;
}

function detectBrowserLocale() {
  if (typeof navigator === 'undefined') return null;
  const language = navigator.language || navigator.userLanguage;
  if (!language) return null;
  const normalized = language.toLowerCase();
  if (normalized.startsWith('zh')) return 'zh-CN';
  if (normalized.startsWith('en')) return 'en-US';
  return null;
}

const initialLocale = readStoredLocale() || detectBrowserLocale() || defaultLocale;

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: initialLocale,
  fallbackLocale: defaultLocale,
  messages,
});

function applyVantLocale(locale) {
  const targetLocale = vantMessages[locale];
  if (targetLocale) {
    VantLocale.use(locale, targetLocale);
  }
}

applyVantLocale(initialLocale);

export function translate(key, fallback = '') {
  if (!key) return fallback;
  const translated = i18n.global.t(key);
  if (translated === key) {
    return fallback || key;
  }
  return translated;
}

export function changeLocale(nextLocale) {
  if (!nextLocale || !Object.prototype.hasOwnProperty.call(messages, nextLocale)) {
    return;
  }
  i18n.global.locale.value = nextLocale;
  applyVantLocale(nextLocale);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage?.setItem(LOCALE_STORAGE_KEY, nextLocale);
    } catch (err) {
      // 忽略 storage 写入异常
    }
  }
}

export { LOCALE_STORAGE_KEY };

export default i18n;
