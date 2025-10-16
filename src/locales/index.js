import { createI18n } from 'vue-i18n';
import zhCN from './zh-CN';
import enUS from './en-US';

const defaultLocale = 'zh-CN';

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: defaultLocale,
  fallbackLocale: defaultLocale,
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
});

export function translate(key, fallback = '') {
  if (!key) return fallback;
  const translated = i18n.global.t(key);
  if (translated === key) {
    return fallback || key;
  }
  return translated;
}

export default i18n;
