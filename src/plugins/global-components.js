// src/plugins/global-components.js
import { defineAsyncComponent } from 'vue';

export default function createGlobalComponents(options = {}) {
  const {
    prefix = '',
    mode = 'eager', // 'eager' | 'lazy'
    include, // RegExp | (path)=>boolean
    exclude = /\/(_private|__internal|__tests__)\/|\.demo\.vue$/i,
    caseStyle = 'pascal', // 'pascal' | 'kebab'
    alias = {},
  } = options;

  const isEager = mode === 'eager';

  // ⚠️ pattern 和 options 都必须是**字面量**，不能用变量表达式
  // 因此做成分支：eager 用 { eager: true }；lazy 不传 options
  const modules = isEager
    ? {
        ...import.meta.glob('/src/components/**/*.vue', { eager: true }),
        ...import.meta.glob('/src/widgets/**/*.vue', { eager: true }),
        ...import.meta.glob('/src/shared/components/**/*.vue', { eager: true }),
        ...import.meta.glob('/src/common/components/**/*.vue', { eager: true }),
        ...import.meta.glob('/src/layouts/**/components/**/*.vue', { eager: true }),
        ...import.meta.glob('/src/modules/**/components/**/*.vue', { eager: true }),
        ...import.meta.glob('/src/features/**/components/**/*.vue', { eager: true }),
        ...import.meta.glob('/src/pages/**/components/**/*.vue', { eager: true }),
      }
    : {
        ...import.meta.glob('/src/components/**/*.vue'),
        ...import.meta.glob('/src/widgets/**/*.vue'),
        ...import.meta.glob('/src/shared/components/**/*.vue'),
        ...import.meta.glob('/src/common/components/**/*.vue'),
        ...import.meta.glob('/src/layouts/**/components/**/*.vue'),
        ...import.meta.glob('/src/modules/**/components/**/*.vue'),
        ...import.meta.glob('/src/features/**/components/**/*.vue'),
        ...import.meta.glob('/src/pages/**/components/**/*.vue'),
      };

  // ---------- utils ----------
  const getBaseName = (filePath) => {
    const filename = filePath.split('/').pop() || '';
    return filename.replace(/\.vue$/i, '');
  };

  const toPascal = (s) =>
    s
      .replace(/[\s_-]+/g, ' ')
      .replace(/(^\w|\s\w)/g, (m) => m.trim().toUpperCase())
      .replace(/\s+/g, '');

  const toKebab = (s) =>
    s
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();

  const makeName = (base) => {
    const core = caseStyle === 'kebab' ? toKebab(base) : toPascal(base);
    return prefix ? `${prefix}${caseStyle === 'kebab' ? '-' : ''}${core}` : core;
  };

  const match = (tester, value) => {
    if (!tester) return true;
    if (tester instanceof RegExp) return tester.test(value);
    if (typeof tester === 'function') return !!tester(value);
    return true;
  };

  // ---------- install ----------
  return {
    install(app) {
      const registered = new Set();

      for (const [path, modOrLoader] of Object.entries(modules)) {
        if (!match(include, path) || match(exclude, path)) continue;

        const base = getBaseName(path);
        const targetName = alias[path] || alias[base] || makeName(base);

        if (registered.has(targetName)) {
          if (import.meta.env.MODE !== 'production') {
            console.warn(`[global-components] Duplicate: ${targetName} from ${path}`);
          }
          continue;
        }

        if (isEager) {
          const comp = modOrLoader?.default;
          if (!comp) continue;
          app.component(targetName, comp);
        } else {
          const loader = /** @type {Function} */ (modOrLoader);
          app.component(
            targetName,
            defineAsyncComponent(() => loader().then((m) => m.default))
          );
        }

        registered.add(targetName);
      }
    },
  };
}
