import { defineStore } from 'pinia';

const STORAGE_KEY = 'debug:vconsole-enabled';
const VCONSOLE_CDN = 'https://unpkg.com/vconsole@3.15.1/dist/vconsole.min.js';

let vconsoleInstance = null;
let loaderPromise = null;

function readPersistedState() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch (error) {
    console.warn('[debug] Failed to read vconsole flag from storage', error);
    return false;
  }
}

function persistState(enabled) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
  } catch (error) {
    console.warn('[debug] Failed to persist vconsole flag', error);
  }
}

function loadVConsoleConstructor() {
  if (typeof window === 'undefined') return Promise.reject(new Error('window unavailable'));

  if (window.VConsole) {
    return Promise.resolve(window.VConsole);
  }

  if (!loaderPromise) {
    loaderPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = VCONSOLE_CDN;
      script.async = true;
      script.onload = () => {
        if (window.VConsole) {
          resolve(window.VConsole);
        } else {
          loaderPromise = null;
          reject(new Error('VConsole loaded without constructor'));
        }
      };
      script.onerror = () => {
        loaderPromise = null;
        reject(new Error('Failed to load VConsole script'));
      };
      document.head.appendChild(script);
    });
  }

  return loaderPromise;
}

async function ensureVConsole() {
  if (vconsoleInstance) return vconsoleInstance;

  const VConsoleConstructor = await loadVConsoleConstructor();
  vconsoleInstance = new VConsoleConstructor();
  return vconsoleInstance;
}

function destroyVConsole() {
  if (vconsoleInstance && typeof vconsoleInstance.destroy === 'function') {
    vconsoleInstance.destroy();
  }
  vconsoleInstance = null;
}

export const useDebugStore = defineStore('debug', {
  state: () => ({
    vconsoleEnabled: readPersistedState(),
    initialized: false,
  }),
  actions: {
    async init() {
      if (this.initialized) return;
      this.initialized = true;

      if (this.vconsoleEnabled) {
        try {
          await ensureVConsole();
        } catch (error) {
          console.warn('[debug] Failed to initialize VConsole', error);
          this.vconsoleEnabled = false;
          persistState(false);
        }
      }
    },
    async setVConsoleEnabled(enabled) {
      if (enabled === this.vconsoleEnabled && this.initialized) {
        return;
      }

      if (!this.initialized) {
        this.initialized = true;
      }

      if (enabled) {
        try {
          await ensureVConsole();
          this.vconsoleEnabled = true;
          persistState(true);
        } catch (error) {
          console.warn('[debug] Failed to enable VConsole', error);
          this.vconsoleEnabled = false;
          persistState(false);
          throw error;
        }
      } else {
        destroyVConsole();
        this.vconsoleEnabled = false;
        persistState(false);
      }
    },
  },
});
