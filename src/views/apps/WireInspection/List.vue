<template>
  <div class="page wire-inspection-list">
    <dc-pagination
      ref="paginationRef"
      v-model:keyword="keyword"
      v-model:active-status="activeStatus"
      :status-options="statusOptions"
      search-placeholder="请输入执行单单号"
      :fetcher="fetcher"
      :page-size="8"
      :offset="200"
      :get-nav-el="() => navRef.value?.getNavEl?.()"
      @add="handleCreate"
    >
      <template #nav>
        <dc-nav-bar ref="navRef" title="线材质检" fixed left-arrow @click-left="goBack" />
      </template>

      <template #sticky="{ resetAndLoad }">
        <div class="wi-search-bar">
          <van-search
            v-model="keyword"
            placeholder="请输入执行单单号"
            shape="round"
            background="#fff"
            clearable
            @search="resetAndLoad()"
            @clear="resetAndLoad()"
          />
        </div>
      </template>

      <template #item="{ item, index }">
        <div class="wi-card">
          <div class="wi-card__index">#{{ index + 1 }}</div>
          <div class="wi-card__fields">
            <div v-for="col in columns" :key="col.prop" class="wi-field">
              <span class="wi-field__label">{{ col.label }}</span>
              <span class="wi-field__value">{{ renderValue(item, col) }}</span>
            </div>
          </div>
        </div>
      </template>

      <template #empty>
        <van-empty description="暂无线材质检记录" />
      </template>
    </dc-pagination>
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import Api from '@/api';
import {
  listColumns,
  fallbackQualifiedOptions,
  fallbackExceptionOptions,
  normalizeDictOptions,
  resolveDictLabel,
} from './constants';

defineOptions({ name: 'WireInspectionList' });

const router = useRouter();
const navRef = ref(null);
const paginationRef = ref(null);

const keyword = ref('');
const activeStatus = ref(null);
const statusOptions = [{ label: '全部', value: null }];

const { proxy } = getCurrentInstance();
const dicts = proxy?.dicts?.(['QualifiedEnum', 'DC_WIRE_EXCEPTION_TYPE']) || {};

const qualifiedOptions = computed(() => {
  const normalized = normalizeDictOptions(dicts?.QualifiedEnum, []);
  return normalized.length ? normalized : fallbackQualifiedOptions;
});

const exceptionOptions = computed(() => {
  const normalized = normalizeDictOptions(dicts?.DC_WIRE_EXCEPTION_TYPE, []);
  return normalized.length ? normalized : fallbackExceptionOptions;
});

const columns = listColumns;

async function fetcher({ pageNo, pageSize, keyword: kw, status }) {
  const params = {
    current: pageNo,
    size: pageSize,
  };

  const trimmedKeyword = (kw ?? '').toString().trim();
  if (trimmedKeyword) params.no = trimmedKeyword;
  if (status) params.status = status;

  const res = await Api.application.wireInspection.list(params);
  const payload = res?.data ?? res ?? {};
  const { code, data, msg, message } = payload;
  if (code !== 200) {
    const error = new Error(message || msg || '获取线材质检列表失败');
    error.payload = payload;
    throw error;
  }
  return data;
}

function goBack() {
  router.back();
}

function handleCreate() {
  router.push({ name: 'appsWireInspectionSubmit' });
}

function renderValue(item, col) {
  const value = item?.[col.prop];
  if (col.type === 'dict') {
    const options = col.dictKey === 'QualifiedEnum' ? qualifiedOptions.value : exceptionOptions.value;
    const label = resolveDictLabel(options, value);
    return label || '-';
  }
  if (value === null || value === undefined || value === '') return '-';
  return value;
}

function handleRefreshEvent() {
  paginationRef.value?.resetAndLoad?.();
}

onMounted(() => {
  window.addEventListener('wireInspection:refresh', handleRefreshEvent);
});

onBeforeUnmount(() => {
  window.removeEventListener('wireInspection:refresh', handleRefreshEvent);
});
</script>

<style scoped lang="scss">
.wire-inspection-list {
  min-height: 100vh;
  background: #f7f8fa;
}

.wi-search-bar {
  padding: 8px 12px 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.wi-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &__index {
    font-weight: 600;
    font-size: 15px;
    margin-bottom: 8px;
    color: #323233;
  }

  &__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 12px;
  }
}

.wi-field {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: #646566;

  &__label {
    color: #969799;
    margin-bottom: 2px;
  }

  &__value {
    color: #323233;
    word-break: break-all;
  }
}
</style>
