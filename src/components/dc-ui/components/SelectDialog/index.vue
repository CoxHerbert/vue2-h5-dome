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
        <van-button size="small" type="primary" @click="confirmSelection">{{ confirmText }}</van-button>
      </div>

      <div class="dc-select-dialog__body">
        <div v-if="searchFields.length" class="dc-select-dialog__search">
          <div
            v-for="field in searchFields"
            :key="field.prop"
            class="dc-select-dialog__search-item"
          >
            <label class="dc-select-dialog__search-label">{{ field.label }}</label>
            <van-field
              v-model="searchState[field.prop]"
              :placeholder="field.searchProps?.placeholder || `请输入${field.label}`"
              clearable
              @clear="onSearch"
            />
          </div>
          <div class="dc-select-dialog__search-actions">
            <van-button type="default" size="small" @click="resetSearch">重置</van-button>
            <van-button type="primary" size="small" @click="onSearch">查询</van-button>
          </div>
        </div>

        <div v-if="selectedRows.length" class="dc-select-dialog__selected">
          <div class="dc-select-dialog__selected-header">
            <span>已选 {{ selectedRows.length }}</span>
            <van-button v-if="clearable" text type="danger" size="small" @click="clearSelection">
              清空
            </van-button>
          </div>
          <div class="dc-select-dialog__selected-tags">
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

        <div class="dc-select-dialog__list">
          <van-loading v-if="loading" size="24px" vertical>加载中...</van-loading>
          <van-empty v-else-if="!tableData.length" description="暂无数据" />
          <div v-else class="dc-select-dialog__rows">
            <div
              v-for="row in tableData"
              :key="getKey(row)"
              class="dc-select-dialog__row"
              :class="{ active: isSelected(row) }"
              @click="toggleRow(row)"
            >
              <van-checkbox
                v-if="multiple"
                :model-value="isSelected(row)"
                @click.stop="toggleRow(row)"
              />
              <van-radio v-else :model-value="isSelected(row)" @click.stop="toggleSingle(row)" />
              <div class="dc-select-dialog__row-content">
                <div
                  v-for="col in modelColumns"
                  :key="col.prop"
                  class="dc-select-dialog__cell"
                >
                  <span class="dc-select-dialog__cell-label">{{ col.label }}</span>
                  <span class="dc-select-dialog__cell-value">
                    <template v-if="col.component === 'dc-view'">
                      <dc-view
                        v-model="row[col.prop]"
                        type="text"
                        :object-name="col.objectName"
                        :show-label="col.showKey || col.prop"
                      />
                    </template>
                    <template v-else-if="col.component === 'dc-dict'">
                      <dc-dict
                        type="text"
                        :value="row[col.prop]"
                        :options="dictMaps[col.dictData]"
                      />
                    </template>
                    <template v-else-if="col.component === 'dc-dict-key'">
                      <dc-dict
                        type="text"
                        :value="row[col.prop]"
                        :options="dictMaps[col.dictData]"
                      />
                    </template>
                    <template v-else>
                      {{ formatCell(row, col) }}
                    </template>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="pageCount > 1" class="dc-select-dialog__footer">
        <van-pagination
          v-model="currentPage"
          :total-items="total"
          :items-per-page="queryParams.size"
          mode="simple"
          @change="handlePageChange"
        />
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
const total = ref(0);
const tableData = ref([]);
const selectedRows = ref([]);
const dictMaps = reactive({});
const queryParams = reactive({ current: 1, size: 20 });
const searchState = reactive({});
const initDefaultSearch = ref(true);
const model = ref(null);
const rowKeyRef = ref('id');
const currentPage = ref(1);

const cacheStore = useGlobalCacheStore();
const dictStore = useDictStore();

const popupHeight = computed(() => '100vh');
const popupTitle = computed(() => props.title || model.value?.title || '请选择');
const confirmText = computed(() => model.value?.submitTitle || '确定');
const placeholderText = computed(() => props.placeholder || model.value?.placeholder || '请选择');

const keyField = computed(() => props.masterKey || model.value?.rowKey || rowKeyRef.value || 'id');
const modelColumns = computed(() => (Array.isArray(model.value?.column) ? model.value.column : []));
const searchFields = computed(() => modelColumns.value.filter((col) => col?.search));
const pageCount = computed(() => {
  const size = Number(queryParams.size) || 20;
  if (!size) return 1;
  return Math.max(1, Math.ceil(total.value / size));
});

const displayTags = computed(() => {
  return selectedRows.value.map((row) => ({
    key: getKey(row),
    label: getDisplayLabel(row) || getKey(row) || '-',
  }));
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
    queryParams.current = 1;
    queryParams.size = 20;
    initDefaultSearch.value = true;
    if (model.value?.search?.params && initDefaultSearch.value) {
      Object.assign(queryParams, model.value.search.params);
    }
    resetSearch(true);
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

const multiple = computed(() => props.multiple !== false);

function openPopup() {
  if (props.disabled) return;
  open.value = true;
  fetchData();
}

function handleClose() {
  total.value = 0;
  tableData.value = [];
  queryParams.current = 1;
}

async function fetchData() {
  if (!model.value?.dialogGet) return;
  loading.value = true;
  const paginationParams = props.query?.currentPage
    ? { currentPage: queryParams.current, pageSize: queryParams.size }
    : {};
  try {
    const res = await model.value.dialogGet({
      ...queryParams,
      ...(props.query || {}),
      ...paginationParams,
      ...searchState,
    });
    const callBack = model.value?.callBack
      ? model.value.callBack(res)
      : res?.data?.data ?? res?.data ?? {};
    const records = callBack?.records || [];
    const list = Array.isArray(records)
      ? records
      : Array.isArray(callBack)
      ? callBack
      : [];
    tableData.value = list.map((item) => ({ ...item }));
    total.value = callBack?.total ?? res?.data?.total ?? list.length;
    currentPage.value = queryParams.current;
    syncSelectionFromTable();
  } catch (error) {
    console.error(error);
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
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

function syncSelectionFromTable() {
  if (!selectedRows.value.length || !tableData.value.length) return;
  const map = new Map(tableData.value.map((row) => [getKey(row), row]));
  selectedRows.value = selectedRows.value.map((item) => {
    const key = getKey(item);
    const hit = map.get(key);
    return hit ? { ...hit } : item;
  });
}

function getDisplayLabel(row) {
  const labelKey = props.showKey || model.value?.defaultLabel || keyField.value;
  return row?.[labelKey];
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

function handlePageChange(page) {
  currentPage.value = page;
  queryParams.current = page;
  fetchData();
}

function onSearch() {
  queryParams.current = 1;
  fetchData();
}

function resetSearch(force = false) {
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
  flex-wrap: wrap;
  gap: 6px;
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
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.dc-select-dialog__search {
  background: #f7f8fa;
  padding: 12px;
  border-radius: 8px;
}

.dc-select-dialog__search-item + .dc-select-dialog__search-item {
  margin-top: 8px;
}

.dc-select-dialog__search-label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #646566;
}

.dc-select-dialog__search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.dc-select-dialog__selected {
  background: #fff7e6;
  padding: 12px;
  border-radius: 8px;
}

.dc-select-dialog__selected-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 8px;
}

.dc-select-dialog__selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dc-select-dialog__list {
  flex: 1;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.dc-select-dialog__list :deep(.van-loading),
.dc-select-dialog__list :deep(.van-empty) {
  margin: auto;
}

.dc-select-dialog__rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.dc-select-dialog__row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f1f2f3;
  &.active {
    border-color: var(--van-primary-color, #1989fa);
    box-shadow: 0 0 0 2px rgba(25, 137, 250, 0.1);
  }
}

.dc-select-dialog__row-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dc-select-dialog__cell {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #323233;
}

.dc-select-dialog__cell-label {
  color: #969799;
  margin-right: 8px;
}

.dc-select-dialog__footer {
  padding: 12px 16px 16px;
  border-top: 1px solid #f5f6f7;
  flex-shrink: 0;
}
</style>
