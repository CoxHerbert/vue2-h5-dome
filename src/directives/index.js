import { inject, getCurrentInstance, reactive, ref } from 'vue';
import perm from './perm';
import antiClick from './anti-click';

export function setupDirectives(app) {
  app.directive('perm', perm);
  app.directive('anti-click', antiClick);
}

function normalizeCodes(codes) {
  if (Array.isArray(codes)) return codes.filter(Boolean);
  return codes ? [codes] : [];
}

function resolveDictClient({ allowInject = true } = {}) {
  let client = null;
  if (allowInject) {
    try {
      client = inject('dictClient', null);
    } catch (err) {
      client = null;
    }
  }
  if (client) return client;
  const instance = getCurrentInstance();
  return instance?.appContext?.config?.globalProperties?.$dictClient ?? null;
}

function createDictLoader(client, codes, state, options = {}, setLoading) {
  const baseAs = options.as ?? 'flat';
  const baseForce = options.force ?? false;
  const baseParams = options.params;

  return async function loadDicts(target = codes, extra = {}) {
    const list = normalizeCodes(target).filter((code) => codes.includes(code));
    if (!list.length || !client) return {};

    if (setLoading) setLoading(true);
    const finalAs = extra.as ?? baseAs;
    const finalForce = extra.force ?? baseForce;
    const finalParams = extra.params ?? baseParams;

    try {
      if (finalAs === 'tree') {
        const result = {};
        await Promise.all(
          list.map(async (code) => {
            const data = await client.getTree(code, { force: finalForce, params: finalParams });
            state[code] = Array.isArray(data) ? data : [];
            result[code] = state[code];
          })
        );
        return result;
      }

      const map = await client.getMany(list, { force: finalForce, params: finalParams });
      list.forEach((code) => {
        state[code] = Array.isArray(map[code]) ? map[code] : [];
      });
      return map;
    } finally {
      if (setLoading) setLoading(false);
    }
  };
}

/**
 * setup 语法糖：在 `<script setup>` 或 `setup()` 中快速获取字典
 * ```js
 * import { useDictSetup } from '@/directives';
 * const { dicts, reloadDicts } = useDictSetup(['DC_ERP_UNIT']);
 * ```
 */
export function useDictSetup(codes, options = {}) {
  const dictCodes = normalizeCodes(codes);
  const dictState = reactive({});
  dictCodes.forEach((code) => {
    dictState[code] = [];
  });

  const loading = ref(false);
  const client = resolveDictClient({ allowInject: true });

  if (!client) {
    console.warn('[directives] dictClient 未注册，请确认 createDictPlugin 已安装');
    return {
      dicts: dictState,
      reloadDicts: async () => ({}),
      dictLoading: loading,
      hasDictClient: false,
    };
  }

  const reloadDicts = createDictLoader(client, dictCodes, dictState, options, (flag) => {
    loading.value = flag;
  });
  reloadDicts(dictCodes);

  return {
    dicts: dictState,
    reloadDicts,
    dictLoading: loading,
    hasDictClient: true,
  };
}

/**
 * options API 语法：在组件中混入
 * ```js
 * import { createDictMixin } from '@/directives';
 * export default {
 *   mixins: [createDictMixin(['DC_ERP_UNIT'])],
 *   created() {
 *     // this.dicts.DC_ERP_UNIT 即可使用
 *   },
 * };
 * ```
 */
export function createDictMixin(codes, options = {}) {
  const dictCodes = normalizeCodes(codes);

  return {
    data() {
      const state = {};
      dictCodes.forEach((code) => {
        state[code] = [];
      });
      return {
        dicts: state,
        dictLoading: false,
      };
    },
    created() {
      const client = resolveDictClient({ allowInject: false });
      if (!client) {
        console.warn('[directives] dictClient 未注册，请确认 createDictPlugin 已安装');
        return;
      }

      const updateLoading = (flag) => {
        this.dictLoading = flag;
      };
      const reload = createDictLoader(client, dictCodes, this.dicts, options, updateLoading);
      this.reloadDicts = reload;
      reload(dictCodes);
    },
  };
}
