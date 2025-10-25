<template>
  <div class="dc-select-dialog" :style="{ width }">
    <div v-if="$slots.default" class="dc-select-dialog__trigger" @click="openPopup">
      <slot></slot>
    </div>
    <div v-else class="dc-select-dialog__trigger" :class="{ disabled }" @click="openPopup">
      <div v-if="multiple && displayTags.length" class="dc-select-dialog__tags">
        <van-tag
          v-for="tag in displayTags"
          :key="tag.key"
          type="primary"
          size="medium"
          :color="tagColor"
          :text-color="tagTextColor"
          :closeable="clearable"
          @close.stop="removeTag(tag.key)"
        >
          {{ tag.label }}
        </van-tag>
      </div>
      <div v-else-if="!multiple && displayTags.length" class="dc-select-dialog__text">
        {{ displayTags[0]?.label || '-' }}
      </div>
      <div v-else class="dc-select-dialog__placeholder">
        {{ placeholderText }}
      </div>
      <van-icon
        v-if="clearable && displayTags.length"
        name="cross"
        class="dc-select-dialog__clear"
        @click.stop="clearSelection"
      />
      <van-icon name="arrow" class="dc-select-dialog__arrow" />
    </div>

    <van-popup
      v-model:show="open"
      position="bottom"
      round
      class="dc-select-dialog__popup"
      teleport="body"
      close-icon="close"
      closeable
      :style="{ height: popupHeight }"
      @close="handleClose"
    >
      <div class="dc-select-dialog__header">
        <span class="dc-select-dialog__title">{{ popupTitle }}</span>
      </div>

      <div v-loading="loading" class="dc-select-dialog__body">
        <div class="dc-select-dialog__list">
          <DcPagination
            ref="pagerRef"
            class="dc-select-dialog__pagination"
            :fetcher="paginationFetcher"
            :page-size="pageSize"
            :offset="120"
            :add-visible="false"
            :immediate="false"
            :back-top-threshold="Infinity"
            :get-nav-el="getNavElement"
          >
            <template #sticky="{ resetAndLoad }">
              <div class="dc-select-dialog__sticky">
                <div v-if="searchFields.length" class="dc-select-dialog__search" :class="{ 'is-collapsed': searchCollapsed }">
                  <div class="dc-select-dialog__search-preview">
                    <div class="dc-select-dialog__search-chips" @click="toggleSearchPanel">
                      <template v-if="searchPreviewChips.length">
                        <span
                          v-for="chip in searchPreviewChips"
                          :key="chip.key"
                          class="dc-select-dialog__search-chip"
                        >
                          {{ chip.text }}
                        </span>
                      </template>
                      <span v-else class="dc-select-dialog__search-placeholder">点击展开筛选条件</span>
                    </div>
                    <div class="dc-select-dialog__search-controls">
                      <van-button text size="small" type="primary" @click="toggleSearchPanel">
                        {{ searchCollapsed ? '展开' : '收起' }}
                        <van-icon :name="searchCollapsed ? 'arrow-down' : 'arrow-up'" size="14" />
                      </van-button>
                      <van-button
                        type="default"
                        size="small"
                        plain
                        @click="() => resetSearch(false, resetAndLoad)"
                      >
                        重置
                      </van-button>
                      <van-button type="primary" size="small" @click="() => onSearch(resetAndLoad)">
                        查询
                      </van-button>
                    </div>
                  </div>
                  <transition name="van-fade">
                    <div v-show="!searchCollapsed" class="dc-select-dialog__search-panel">
                      <div class="dc-select-dialog__search-grid">
                        <van-field
                          v-for="field in searchFields"
                          :key="field.prop"
                          v-model="searchState[field.prop]"
                          :label="field.label"
                          :placeholder="field.searchProps?.placeholder || `请输入${field.label}`"
                          clearable
                          label-width="auto"
                          @clear="() => onSearch(resetAndLoad)"
                        />
                      </div>
                    </div>
                  </transition>
                </div>

                <div v-if="selectedRows.length" class="dc-select-dialog__selected" :class="{ 'is-collapsed': selectedCollapsed }">
                  <div class="dc-select-dialog__selected-header">
                    <span>已选 {{ selectedRows.length }}</span>
                    <div class="dc-select-dialog__selected-actions">
                      <van-button
                        v-if="clearable"
                        text
                        type="danger"
                        size="small"
                        @click="clearSelection"
                      >
                        清空
                      </van-button>
                      <van-button text size="small" @click="toggleSelectedCollapsed">
                        {{ selectedCollapsed ? '展开' : '收起' }}
                        <van-icon :name="selectedCollapsed ? 'arrow-down' : 'arrow-up'" size="14" />
                      </van-button>
                    </div>
                  </div>
                  <div class="dc-select-dialog__selected-tags" :class="{ 'is-collapsed': selectedCollapsed }">
                    <van-tag
                      v-for="row in selectedRows"
                      :key="getKey(row)"
                      type="danger"
                      plain
                      size="small"
                      :closeable="clearable"
                      @close.stop="removeTag(getKey(row))"
                    >
                      {{ getDisplayLabel(row) }}
                    </van-tag>
                  </div>
                </div>
              </div>
            </template>

            <template #item="{ item }">
              <div
                class="dc-select-dialog__row"
                :class="{ active: isSelected(item) }"
                @click="toggleRow(item)"
              >
                <van-checkbox
                  v-if="multiple"
                  :model-value="isSelected(item)"
                  @click.stop="toggleRow(item)"
                />
                <van-radio v-else :model-value="isSelected(item)" @click.stop="toggleSingle(item)" />
                <div class="dc-select-dialog__row-content">
                  <div
                    v-for="col in modelColumns"
                    :key="col.prop"
                    class="dc-select-dialog__cell"
                  >
                    <span class="dc-select-dialog__cell-label">{{ col.label }}</span>
                    <div class="dc-select-dialog__cell-value">
                      <template v-if="col.component === 'dc-view'">
                        <dc-view
                          v-model="item[col.prop]"
                          type="text"
                          :object-name="col.objectName"
                          :show-label="col.showKey || col.prop"
                        />
                      </template>
                      <template v-else-if="col.component === 'dc-dict'">
                        <dc-dict
                          type="text"
                          :value="item[col.prop]"
                          :options="dictMaps[col.dictData]"
                        />
                      </template>
                      <template v-else-if="col.component === 'dc-dict-key'">
                        <dc-dict-key
                          type="text"
                          :value="item[col.prop]"
                          :options="dictMaps[col.dictData]"
                        />
                      </template>
                      <template v-else>
                        {{ formatCell(item, col) }}
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <template #empty>
              <van-empty description="暂无数据" />
            </template>
          </DcPagination>
        </div>
      </div>

      <div class="dc-select-dialog__footer">
        <van-button block type="primary" @click="confirmSelection">{{ confirmText }}</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch, nextTick, getCurrentInstance } from 'vue';
import { useGlobalCacheStore } from '@/store/global-cache';
import { useDictStore } from '@/store/dict';
import cacheRequest from '@/components/dc-ui/util/request';
import cacheData from '@/components/dc-ui/constant/cacheData';
import DcPagination from '@/components/dc-ui/components/Pagination/index.vue';

defineOptions({ name: 'SelectDialog' });

const props = defineProps({
  modelValue: { type: [Array, Object, String, Number], default: null },
  objectName: { type: String, default: '' },
  placeholder: { type: String, default: '请选择' },
  width: { type: String, default: '100%' },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true },
  multiple: { type: Boolean, default: true },
  showValue: { type: Boolean, default: true },
  showKey: { type: String, default: '' },
  masterKey: { type: String, default: '' },
  returnType: { type: String, default: 'array' },
  dialogWidth: { type: [String, Number], default: '100%' },
  title: { type: String, default: '' },
  query: { type: Object, default: () => ({}) },
  change: { type: Function, default: null },
  dynamicIndex: { type: [Number, String], default: null },
  column: { type: Object, default: null },
  tagColor: { type: String, default: '#ecf5ff' },
  tagTextColor: { type: String, default: '#1989fa' },
});

const emit = defineEmits(['update:modelValue', 'change']);

const instance = getCurrentInstance();
if (instance?.type) {
  instance.type.dcAliases = ['wf-select-dialog'];
}

const open = ref(false);
const loading = ref(false);
const pagerRef = ref(null);
const pageSize = ref(20);
const selectedRows = ref([]);
const searchCollapsed = ref(true);
const selectedCollapsed = ref(true);
const dictMaps = reactive({});
const searchState = reactive({});
const initDefaultSearch = ref(true);
const model = ref(null);
const rowKeyRef = ref('id');

const zeroNavEl = { getBoundingClientRect: () => ({ height: 0 }) };

const cacheStore = useGlobalCacheStore();
const dictStore = useDictStore();
const getNavElement = () => zeroNavEl;

const popupHeight = computed(() => '100vh');
const popupTitle = computed(() => props.title || model.value?.title || '请选择');
const confirmText = computed(() => model.value?.submitTitle || '确定');
const placeholderText = computed(() => props.placeholder || model.value?.placeholder || '请选择');

const keyField = computed(() => props.masterKey || model.value?.rowKey || rowKeyRef.value || 'id');
const modelColumns = computed(() => (Array.isArray(model.value?.column) ? model.value.column : []));
const searchFields = computed(() => modelColumns.value.filter((col) => col?.search));
const displayTags = computed(() => {
  return selectedRows.value.map((row) => ({
    key: getKey(row),
    label: getDisplayLabel(row) || getKey(row) || '-',
  }));
});

const searchPreviewChips = computed(() => {
  return searchFields.value
    .map((field) => {
      const value = searchState[field.prop];
      const hasValue = value !== undefined && value !== null && `${value}`.trim() !== '';
      return {
        key: field.prop,
        label: field.label,
        value,
        hasValue,
        text: hasValue ? `${field.label}: ${value}` : field.label,
      };
    })
    .filter((item) => item.hasValue);
});

const dictCodes = computed(() => {
  const codes = new Set();
  modelColumns.value.forEach((col) => {
    if (col?.dictData) codes.add(col.dictData);
  });
  return Array.from(codes);
});

watch(
  dictCodes,
  async (codes) => {
    Object.keys(dictMaps).forEach((key) => {
      if (!codes.includes(key)) delete dictMaps[key];
    });
    if (!codes.length) return;
    try {
      const result = await dictStore.getMany(codes);
      Object.entries(result).forEach(([code, items]) => {
        dictMaps[code] = items;
      });
    } catch (error) {
      console.error('Failed to load dict data:', error);
    }
  },
  { immediate: true }
);

watch(
  () => props.objectName,
  (name) => {
    model.value = cacheData?.[name] || null;
    if (model.value?.rowKey) {
      rowKeyRef.value = model.value.rowKey;
    }
    const sizeFromModel =
      Number(model.value?.search?.params?.size ?? model.value?.pageSize ?? 0) || 20;
    pageSize.value = sizeFromModel;
    initDefaultSearch.value = true;
    resetSearch(true);
    searchCollapsed.value = true;
  },
  { immediate: true }
);

function parseIds(val) {
  const key = keyField.value;
  if (Array.isArray(val)) {
    return val
      .map((item) => (typeof item === 'object' ? item?.[key] : item))
      .filter((id) => id !== undefined && id !== null && `${id}` !== '');
  }
  if (val && typeof val === 'object') {
    const id = val?.[key];
    return id != null ? [id] : [];
  }
  if (typeof val === 'string') return val.split(',').filter(Boolean);
  if (typeof val === 'number') return [`${val}`];
  return [];
}

watch(
  [() => props.modelValue, () => props.objectName],
  async ([newVal]) => {
    if (!props.showValue) {
      if (!newVal || (Array.isArray(newVal) && !newVal.length) || newVal === '') {
        selectedRows.value = [];
      }
      return;
    }
    await nextTick();
    const ids = parseIds(newVal);
    if (!ids.length || !model.value?.url) {
      selectedRows.value = [];
      return;
    }
    try {
      await cacheRequest.getView({
        url: model.value.url,
        data: ids,
        masterKey: keyField.value,
      });
      const bucket = cacheStore.globalData[model.value.url] || {};
      const rows = Array.isArray(bucket) ? bucket : Object.values(bucket);
      const key = keyField.value;
      selectedRows.value = ids.map((id) => {
        const hit = rows.find((item) => `${item?.[key]}` === `${id}`);
        return hit ? { ...hit } : { [key]: id };
      });
    } catch (error) {
      console.error('Failed to fetch cache data:', error);
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => selectedRows.value.length,
  (len) => {
    if (!len) {
      selectedCollapsed.value = true;
    }
  }
);

watch(
  searchFields,
  (fields) => {
    if (!fields.length) {
      searchCollapsed.value = true;
    }
  },
  { immediate: true }
);

const multiple = computed(() => props.multiple !== false);

function openPopup() {
  if (props.disabled) return;
  open.value = true;
  triggerReload();
}

function toggleSearchPanel() {
  searchCollapsed.value = !searchCollapsed.value;
}

function toggleSelectedCollapsed() {
  selectedCollapsed.value = !selectedCollapsed.value;
}

function handleClose() {
  loading.value = false;
  pagerRef.value?.scrollToTop?.();
}

function triggerReload() {
  nextTick(() => {
    pagerRef.value?.resetAndLoad?.();
  });
}

function mergeSelectionWithRows(rows) {
  if (!selectedRows.value.length || !Array.isArray(rows) || !rows.length) return;
  const map = new Map(rows.map((row) => [getKey(row), row]));
  let updated = false;
  const next = selectedRows.value.map((item) => {
    const hit = map.get(getKey(item));
    if (hit) {
      updated = true;
      return { ...hit };
    }
    return item;
  });
  if (updated) {
    selectedRows.value = next;
  }
}

function normalizeResponse(res, fallbackPageNo, fallbackSize) {
  const raw = model.value?.callBack ? model.value.callBack(res) : res?.data?.data ?? res?.data ?? {};
  let records = [];
  let total = 0;
  let current = fallbackPageNo;
  let pages;
  let size = fallbackSize;

  if (Array.isArray(raw)) {
    records = raw;
    total = raw.length;
  } else if (raw && typeof raw === 'object') {
    if (Array.isArray(raw.records)) {
      records = raw.records;
    } else if (Array.isArray(raw.list)) {
      records = raw.list;
    } else if (Array.isArray(raw.rows)) {
      records = raw.rows;
    }

    total =
      raw.total ??
      raw.count ??
      raw.totalCount ??
      raw.recordsTotal ??
      (Array.isArray(records) ? records.length : 0);
    current = raw.current ?? raw.pageNo ?? raw.page ?? raw.currentPage ?? current;
    pages = raw.pages ?? raw.pageCount ?? raw.totalPage ?? raw.pagesCount;
    size = raw.size ?? raw.pageSize ?? raw.limit ?? size;
  }

  const normalizedRecords = Array.isArray(records) ? records.map((item) => ({ ...item })) : [];
  if (!pages && typeof total === 'number' && total > 0 && typeof size === 'number' && size > 0) {
    pages = Math.ceil(total / size);
  }
  if (!pages && total === 0 && normalizedRecords.length > 0 && typeof size === 'number' && size > 0) {
    pages = normalizedRecords.length < size ? 1 : undefined;
  }

  return {
    records: normalizedRecords,
    total,
    current,
    pages,
    size,
  };
}

async function paginationFetcher({ pageNo, pageSize: sizeParam }) {
  if (!model.value?.dialogGet) {
    return { current: pageNo, pages: 0, total: 0, size: sizeParam || pageSize.value, records: [] };
  }

  const size = Number(sizeParam || pageSize.value || 20) || 20;
  if (pageNo === 1) {
    loading.value = true;
  }

  const paginationParams = props.query?.currentPage
    ? { currentPage: pageNo, pageSize: size }
    : { current: pageNo, size };
  const requestPayload = {
    ...(props.query || {}),
    ...paginationParams,
    ...searchState,
  };

  try {
    const response = await model.value.dialogGet(requestPayload);
    const normalized = normalizeResponse(response, pageNo, size);
    mergeSelectionWithRows(normalized.records);
    if (typeof normalized.size === 'number' && normalized.size > 0 && normalized.size !== pageSize.value) {
      pageSize.value = normalized.size;
    }
    return {
      current: normalized.current ?? pageNo,
      pages: normalized.pages,
      total:
        typeof normalized.total === 'number' && normalized.total > 0
          ? normalized.total
          : normalized.records.length,
      size: normalized.size ?? size,
      records: normalized.records,
    };
  } catch (error) {
    console.error('Failed to fetch dialog data:', error);
    throw error;
  } finally {
    if (pageNo === 1) {
      loading.value = false;
    }
  }
}

function isSelected(row) {
  const key = getKey(row);
  return selectedRows.value.some((item) => getKey(item) === key);
}

function toggleRow(row) {
  if (!multiple.value) {
    toggleSingle(row);
    return;
  }
  const key = getKey(row);
  const index = selectedRows.value.findIndex((item) => getKey(item) === key);
  if (index > -1) {
    selectedRows.value.splice(index, 1);
  } else {
    selectedRows.value.push({ ...row });
  }
}

function toggleSingle(row) {
  if (isSelected(row)) {
    selectedRows.value = [];
  } else {
    selectedRows.value = [{ ...row }];
  }
}

function removeTag(key) {
  const index = selectedRows.value.findIndex((item) => getKey(item) === key);
  if (index > -1) {
    selectedRows.value.splice(index, 1);
    applySelection();
  }
}

function clearSelection() {
  selectedRows.value = [];
  applySelection();
}

function getKey(row) {
  const key = keyField.value;
  return row?.[key] != null ? `${row[key]}` : '';
}

function getDisplayLabel(row) {
  const labelKey = props.showKey || model.value?.defaultLabel || keyField.value;
  const value = row?.[labelKey];
  if (value !== undefined && value !== null && `${value}` !== '') {
    return value;
  }
  const fallbackKey = modelColumns.value?.[0]?.prop;
  if (fallbackKey && row?.[fallbackKey] != null && `${row[fallbackKey]}` !== '') {
    return row[fallbackKey];
  }
  return row?.[keyField.value];
}

function formatCell(row, column) {
  const value = row?.[column.prop];
  if (value === undefined || value === null || value === '') return '-';
  return value;
}

function applySelection() {
  const key = keyField.value;
  if (multiple.value) {
    const payload =
      props.returnType === 'string'
        ? selectedRows.value
            .map((item) => item?.[key])
            .filter((v) => v != null && v !== '')
            .join(',')
        : selectedRows.value.map((item) => ({ ...item }));
    emit('update:modelValue', payload);
    emit('change', selectedRows.value.map((item) => ({ ...item })));
    if (typeof props.change === 'function') {
      props.change({ value: selectedRows.value, column: props.column, index: props.dynamicIndex });
    }
  } else {
    const row = selectedRows.value.length ? selectedRows.value[0] : null;
    const payload =
      props.returnType === 'string' ? (row ? row?.[key] ?? null : null) : row ? { ...row } : null;
    emit('update:modelValue', payload);
    emit('change', row ? { ...row } : null);
    if (typeof props.change === 'function') {
      props.change({ value: row, column: props.column, index: props.dynamicIndex });
    }
  }
}

function confirmSelection() {
  applySelection();
  open.value = false;
}

function onSearch(resetFn) {
  if (typeof resetFn === 'function') {
    resetFn();
  } else {
    triggerReload();
  }
}

function resetSearch(force = false, resetFn) {
  if (!force && !searchFields.value.length) return;
  Object.keys(searchState).forEach((key) => {
    delete searchState[key];
  });
  searchFields.value.forEach((field) => {
    searchState[field.prop] = '';
  });
  if (force && model.value?.search?.params && initDefaultSearch.value) {
    Object.assign(searchState, model.value.search.params);
    initDefaultSearch.value = false;
  } else if (!force) {
    if (typeof resetFn === 'function') {
      resetFn();
    } else {
      triggerReload();
    }
  }
}
</script>

<style lang="scss" scoped>
.dc-select-dialog {
  width: 100%;
}

.dc-select-dialog__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #ebedf0;
  border-radius: 6px;
  color: #323233;
  position: relative;
  flex-wrap: wrap;
  &.disabled {
    opacity: 0.6;
  }
}

.dc-select-dialog__tags {
  display: flex;
  flex: 1;
  gap: 6px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  flex-wrap: nowrap;
}

.dc-select-dialog__text {
  flex: 1;
}

.dc-select-dialog__placeholder {
  flex: 1;
  color: #969799;
}

.dc-select-dialog__clear,
.dc-select-dialog__arrow {
  color: #c8c9cc;
}

.dc-select-dialog__clear {
  margin-left: auto;
}

.dc-select-dialog__popup {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  padding: 0;
}

.dc-select-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f5f6f7;
  flex-shrink: 0;
}

.dc-select-dialog__title {
  font-weight: 500;
  font-size: 16px;
}

.dc-select-dialog__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

.dc-select-dialog__list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dc-select-dialog__pagination {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dc-select-dialog__pagination :deep(.dc-paged-infinite-list) {
  background: transparent;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.dc-select-dialog__pagination :deep(.dc-sticky-header) {
  position: sticky !important;
  top: 0 !important;
  left: 0;
  right: 0;
  background: transparent;
  box-shadow: none;
  padding: 0;
}

.dc-select-dialog__sticky {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px 10px;
  background: #fff;
  border-bottom: 1px solid #f5f6f7;
}

.dc-select-dialog__search {
  background: #f7f8fa;
  padding: 10px 12px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: padding 0.2s ease;
}

.dc-select-dialog__search.is-collapsed {
  padding-bottom: 8px;
}

.dc-select-dialog__search-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.dc-select-dialog__search-chips {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 2px;
  cursor: pointer;
}

.dc-select-dialog__search-chip {
  flex: 0 0 auto;
  background: #fff;
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 12px;
  color: #323233;
  border: 1px solid #ebedf0;
}

.dc-select-dialog__search-placeholder {
  font-size: 12px;
  color: #969799;
  white-space: nowrap;
}

.dc-select-dialog__search-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.dc-select-dialog__search-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dc-select-dialog__search-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}

.dc-select-dialog__search :deep(.van-field) {
  padding: 4px 0;
}

.dc-select-dialog__search :deep(.van-field__label) {
  color: #646566;
  font-size: 12px;
  min-width: 48px;
}

.dc-select-dialog__selected {
  background: #fff7e6;
  padding: 10px 12px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dc-select-dialog__selected.is-collapsed {
  padding-bottom: 8px;
}

.dc-select-dialog__selected-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  gap: 8px;
}

.dc-select-dialog__selected-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dc-select-dialog__selected-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.dc-select-dialog__selected-tags.is-collapsed {
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.dc-select-dialog__pagination :deep(.dc-content) {
  position: relative !important;
  top: 0 !important;
  bottom: auto;
  left: 0;
  right: 0;
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 12px 16px 80px;
}

.dc-select-dialog__pagination :deep(.dc-content .van-pull-refresh) {
  min-height: 100%;
}

.dc-select-dialog__pagination :deep(.dc-content .van-empty) {
  padding: 40px 0;
}

.dc-select-dialog__pagination :deep(.dc-back-top),
.dc-select-dialog__pagination :deep(.dc-fab-add) {
  display: none !important;
}

.dc-select-dialog__row {
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #f1f2f3;
  margin-bottom: 8px;
  &.active {
    border-color: var(--van-primary-color, #1989fa);
    box-shadow: 0 0 0 2px rgba(25, 137, 250, 0.1);
  }
  &:last-child {
    margin-bottom: 0;
  }
}

.dc-select-dialog__row-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dc-select-dialog__cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  font-size: 13px;
  color: #323233;
  text-align: left;
}

.dc-select-dialog__cell-label {
  color: #969799;
  font-size: 12px;
}

.dc-select-dialog__footer {
  padding: 12px 16px 24px;
  border-top: 1px solid #f5f6f7;
  flex-shrink: 0;
  background: #fff;
}

.dc-select-dialog__cell-value {
  color: #323233;
  width: 100%;
  word-break: break-word;
}
</style>
