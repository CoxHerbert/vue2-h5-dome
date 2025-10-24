// 通用分页 Hook（方案B：支持 parser 自定义解析）
// 用于统一管理：list / page / loading / finished / refreshing / resetAndFetch / loadMore / onRefresh
// ⚠️ 本文件与 UI 框架无关，可搭配 Vant、Element、Naive 等任意组件库

import { ref } from 'vue';

/**
 * @param {Function} fetchFn - 异步函数：(params) => Promise(res)
 * @param {Object}   options
 * @param {number}   [options.size=10]  每页条数
 * @param {boolean}  [options.auto=true] 初始是否自动拉第一页
 * @param {Function} [options.parser]   自定义解析器：(res, fallbackSize, pageNo) => { records, total, size, pages, current }
 */
export default function usePaginationList(fetchFn, options = {}) {
  const { size = 10, auto = true, parser } = options;

  // 响应式状态
  const list = ref([]);
  const loading = ref(false); // 供 van-list v-model:loading 绑定
  const finished = ref(false); // 供 van-list :finished 绑定
  const refreshing = ref(false); // 供 van-pull-refresh v-model 绑定
  const page = ref({ current: 1, size, total: 0, pages: 0 });
  let lock = false; // 防并发

  // 默认解析器（兼容你的后端：res.data = { code, data, msg }）
  const defaultParser = (res, fallbackSize, pageNo) => {
    const body = res?.data ?? res;
    if (body?.code && body.code !== 200) {
      throw new Error(body?.msg || '接口返回错误');
    }
    const d = body?.data || {};
    const total = Number(d.total ?? 0);
    const size = Number(d.size ?? fallbackSize);
    const pages = Number(d.pages ?? (total && size ? Math.ceil(total / size) : 0));
    const current = Number(d.current ?? pageNo);

    return {
      records: d.records || [],
      total,
      size,
      pages,
      current,
    };
  };

  // 内部：请求一页
  const fetchPage = async (pageNo = 1, extraParams = {}) => {
    const params = { current: pageNo, size: page.value.size, ...extraParams };
    const res = await fetchFn(params);
    return (parser || defaultParser)(res, page.value.size, pageNo);
  };

  // 重置并拉第一页（搜索/切换Tab/首次进入）
  const resetAndFetch = async (params = {}) => {
    finished.value = false;
    loading.value = false;
    list.value = [];
    page.value = { current: 1, size, total: 0, pages: 0 };
    lock = false;

    loading.value = true;
    try {
      const d = await fetchPage(1, params);
      list.value = d.records;
      page.value = { current: d.current, size: d.size, total: d.total, pages: d.pages };
      finished.value = d.total === 0 || d.current >= d.pages;
    } finally {
      loading.value = false;
      refreshing.value = false;
      lock = false;
    }
  };

  // 触底加载下一页
  const loadMore = async (params = {}) => {
    if (loading.value || finished.value || lock) return;
    if (page.value.pages && page.value.current >= page.value.pages) {
      finished.value = true;
      return;
    }

    lock = true;
    loading.value = true;
    try {
      const next = page.value.current + 1;
      const d = await fetchPage(next, params);

      if (!d.records?.length) {
        finished.value = true;
        return;
      }

      list.value.push(...d.records);
      page.value.current = d.current;
      page.value.pages = d.pages;
      page.value.total = d.total;

      // 双保险：页码或条数达到上限都结束
      finished.value =
        page.value.current >= page.value.pages || list.value.length >= page.value.total;
    } finally {
      loading.value = false;
      lock = false;
    }
  };

  // 下拉刷新（等同于重置再拉第一页）
  const onRefresh = async (params = {}) => {
    refreshing.value = true;
    await resetAndFetch(params);
  };

  // 首次自动加载
  if (auto) resetAndFetch();

  return {
    list,
    page,
    loading,
    finished,
    refreshing,
    resetAndFetch,
    loadMore,
    onRefresh,
  };
}
