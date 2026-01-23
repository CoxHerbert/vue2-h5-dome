<template>
  <div class="nf-crud">
    <!-- Search -->
    <div v-if="showSearch" class="nf-crud__search">
      <!-- 快捷搜索（可选，不影响你原 searchChange） -->
      <van-search
        v-model="quickKeyword"
        :placeholder="option?.searchPlaceholder || '请输入关键字'"
        show-action
        @search="handleSearch"
        @cancel="handleReset"
      />

      <!-- 按 column.search=true 自动生成 -->
      <div v-if="searchColumns.length" class="nf-crud__search-form">
        <div v-for="col in searchColumns" :key="col.prop" class="nf-crud__search-item">
          <van-field
            v-model="searchModel[col.prop]"
            :label="col.label"
            :placeholder="`请输入${col.label}`"
            clearable
          />
        </div>

        <div class="nf-crud__search-actions">
          <van-button size="small" type="primary" @click="handleSearch">查询</van-button>
          <van-button size="small" plain @click="handleReset">重置</van-button>
        </div>
      </div>
    </div>

    <!-- List -->
    <div class="nf-crud__body">
      <van-list
        v-model:loading="innerLoading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadNext"
      >
        <div v-for="row in data" :key="row[rowKey]" class="nf-row" @click="emitRowClick(row)">
          <!-- radio 列：来自 column.type=radio（与你 option 一致） -->
          <div v-if="radioColVisible" class="nf-row__radio" @click.stop>
            <slot name="radio" :row="row">
              <van-radio-group v-model="formProxy.radio">
                <van-radio :name="row[rowKey]" />
              </van-radio-group>
            </slot>
          </div>

          <!-- 内容列 -->
          <div class="nf-row__content">
            <slot name="default" :row="row">
              <div class="nf-row__grid">
                <div v-for="col in displayColumns" :key="col.prop" class="nf-cell">
                  <div class="nf-cell__label">{{ col.label }}</div>
                  <div class="nf-cell__value">
                    <slot :name="`cell-${col.prop}`" :row="row" :value="row[col.prop]">
                      {{ formatCell(row, col) }}
                    </slot>
                  </div>
                </div>
              </div>
            </slot>

            <!-- 你这份 option 里还有 specification/qty，适合放在补充行 -->
            <div v-if="subColumns.length" class="nf-row__sub">
              <div v-for="col in subColumns" :key="col.prop" class="nf-sub-item">
                <span class="nf-sub-label">{{ col.label }}：</span>
                <span class="nf-sub-value">{{ formatCell(row, col) }}</span>
              </div>
            </div>
          </div>
        </div>
      </van-list>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NfCrud',
  props: {
    option: { type: Object, default: () => ({}) },
    tableLoading: { type: Boolean, default: false },
    data: { type: Array, default: () => [] },

    // v-model
    modelValue: { type: Object, default: () => ({}) },

    // v-model:page
    page: {
      type: Object,
      default: () => ({ current: 1, pageSize: 10, total: 0 }),
    },

    // 行主键
    rowKey: { type: String, default: 'id' },
  },
  emits: [
    'update:page',
    'update:modelValue',
    'search-change',
    'search-reset',
    'selection-change',
    'current-change',
    'size-change',
    'row-click',
    'on-load',
  ],

  data() {
    return {
      innerLoading: false,
      finished: false,

      // 搜索
      quickKeyword: '',
      searchModel: {},

      // 内部选中列表（用于 selection-change 兼容）
      selectionList: [],
    };
  },

  computed: {
    formProxy: {
      get() {
        return this.modelValue || {};
      },
      set(v) {
        this.$emit('update:modelValue', v);
      },
    },

    showSearch() {
      return (this.option?.column || []).some((c) => c.search);
    },

    searchColumns() {
      return (this.option?.column || []).filter((c) => c.search);
    },

    radioColVisible() {
      // 你的 option: selection=false，但 radio 列 hide=false，要显示
      const col = (this.option?.column || []).find((c) => c.type === 'radio' || c.prop === 'radio');
      return !!col && col.hide === false;
    },

    displayColumns() {
      // 主展示列：排除 radio / hide=true
      return (this.option?.column || []).filter((c) => {
        if (!c || !c.prop) return false;
        if (c.hide) return false;
        if (c.type === 'radio' || c.prop === 'radio') return false;

        // 你这份 option：motno/materialCode/materialName 更适合作为主网格
        return ['motno', 'materialCode', 'materialName'].includes(c.prop);
      });
    },

    subColumns() {
      // 补充信息行：specification/qty
      return (this.option?.column || []).filter((c) => {
        if (!c || !c.prop) return false;
        if (c.hide) return false;
        if (c.type === 'radio' || c.prop === 'radio') return false;
        return ['specification', 'qty'].includes(c.prop);
      });
    },
  },

  watch: {
    tableLoading: {
      handler(v) {
        this.innerLoading = v;
      },
      immediate: true,
    },

    // option 初始化 searchModel
    option: {
      handler() {
        const m = {};
        this.searchColumns.forEach((c) => (m[c.prop] = ''));
        this.searchModel = m;
      },
      immediate: true,
      deep: true,
    },

    // radio 值变化时，输出 selection-change（对齐你原来 selectionList）
    'formProxy.radio': {
      handler(val) {
        if (!this.radioColVisible) return;
        const row = (this.data || []).find((r) => String(r[this.rowKey]) === String(val));
        this.selectionList = row ? [row] : [];
        this.$emit('selection-change', this.selectionList);
      },
      immediate: true,
    },

    // 数据更新后，如果 radio 已经有值，刷新 selectionList（避免翻页后 selectionList 为空）
    data: {
      handler() {
        const val = this.formProxy?.radio;
        if (!val) return;
        const row = (this.data || []).find((r) => String(r[this.rowKey]) === String(val));
        this.selectionList = row ? [row] : this.selectionList;
        this.$emit('selection-change', this.selectionList);
      },
      deep: true,
    },
  },

  methods: {
    // ============ 兼容你原 nf-crud 的方法 ============
    toggleSelection() {
      // 清空
      const next = { ...(this.formProxy || {}) };
      next.radio = '';
      this.formProxy = next;
      this.selectionList = [];
      this.$emit('selection-change', []);
    },

    toggleRowSelection(row, selected = true) {
      if (!row) return;

      if (this.radioColVisible) {
        const next = { ...(this.formProxy || {}) };
        next.radio = selected ? row[this.rowKey] : '';
        this.formProxy = next;

        this.selectionList = selected ? [row] : [];
        this.$emit('selection-change', this.selectionList);
      }
    },

    // ============ 搜索 ============
    handleSearch() {
      const params = { ...(this.searchModel || {}) };
      if (this.quickKeyword) params.keyword = this.quickKeyword;

      // 重置分页
      const nextPage = { ...(this.page || {}), current: 1 };
      this.finished = false;

      // search-change(params, done) 兼容
      const done = () => {};
      this.$emit('update:page', nextPage);
      this.$emit('current-change', 1);
      this.$emit('search-change', params, done);
      this.$emit('on-load', nextPage, params);
    },

    handleReset() {
      Object.keys(this.searchModel || {}).forEach((k) => (this.searchModel[k] = ''));
      this.quickKeyword = '';
      this.finished = false;

      const nextPage = { ...(this.page || {}), current: 1 };
      this.$emit('update:page', nextPage);
      this.$emit('current-change', 1);
      this.$emit('search-reset');
      this.$emit('on-load', nextPage, {});
    },

    // ============ 触底加载更多 ============
    loadNext() {
      // van-list 触发 loadNext 时，外部应该拉下一页
      const total = Number(this.page?.total || 0);
      const curLoaded = Number((this.data || []).length);

      if (total > 0 && curLoaded >= total) {
        this.finished = true;
        this.innerLoading = false;
        return;
      }

      const nextCurrent = (this.page?.current || 1) + 1;
      const nextPage = { ...(this.page || {}), current: nextCurrent };

      this.$emit('update:page', nextPage);
      this.$emit('current-change', nextCurrent);
      this.$emit('on-load', nextPage, {});
    },

    emitRowClick(row) {
      this.$emit('row-click', row);

      // 你的原逻辑：radio 模式点击行就选中
      if (this.radioColVisible) {
        const next = { ...(this.formProxy || {}) };
        next.radio = row[this.rowKey];
        this.formProxy = next;

        this.selectionList = [row];
        this.$emit('selection-change', this.selectionList);
      }
    },

    formatCell(row, col) {
      const v = row?.[col.prop];
      if (v === null || v === undefined || v === '') return '-';
      return String(v);
    },
  },
};
</script>

<style scoped lang="scss">
.nf-crud {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.nf-crud__search {
  padding: 8px 12px 0;
}

.nf-crud__search-form {
  padding: 8px 0 0;
}

.nf-crud__search-item {
  margin-bottom: 8px;
}

.nf-crud__search-actions {
  display: flex;
  gap: 8px;
  padding: 4px 0 10px;
}

.nf-crud__body {
  flex: 1;
  overflow: auto;
  padding: 0 0 12px;
}

.nf-row {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid #f3f3f3;
}

.nf-row__radio {
  width: 34px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 2px;
}

.nf-row__content {
  flex: 1;
}

.nf-row__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
}

.nf-cell__label {
  font-size: 12px;
  color: #888;
  line-height: 16px;
}

.nf-cell__value {
  font-size: 13px;
  color: #111;
  line-height: 18px;
  word-break: break-all;
}

.nf-row__sub {
  margin-top: 6px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #666;
}

.nf-sub-label {
  color: #888;
}
</style>
