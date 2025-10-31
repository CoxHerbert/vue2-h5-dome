<template>
  <div class="pending-list">
    <dc-pagination
      :fetcher="fetcher"
      :page-size="8"
      :offset="150"
      :add-visible="false"
      search-placeholder="搜索出库单据编号"
      :get-nav-el="getNavEl"
    >
      <template #item="{ item }">
        <div class="pending-card" @click="handleSelect(item)">
          <div class="pending-card__header">
            <div class="title">{{ item.outStockCode ?? '-' }}</div>
            <div class="badge">{{ renderOutType(item.outStockType) }}</div>
          </div>
          <div class="pending-card__body">
            <div class="row">
              <span class="label">申请人</span>
              <span class="value">
                <dc-view :value="item.applicantId" object-name="user" />
              </span>
            </div>
            <div class="row">
              <span class="label">处理人</span>
              <span class="value">
                <dc-view :value="item.processingPersonnel" object-name="user" />
              </span>
            </div>
            <div class="row">
              <span class="label">登记时间</span>
              <span class="value">{{ item.createTime ?? '-' }}</span>
            </div>
          </div>
          <van-icon class="pending-card__icon" name="arrow" size="16" />
        </div>
      </template>
    </dc-pagination>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { showFailToast } from 'vant';
import Api from '@/api';
import { useDictStore } from '@/store/dict';

const { getNavEl } = defineProps({
  getNavEl: { type: Function, default: null },
});

const emit = defineEmits(['select']);

const dictStore = useDictStore();
const outTypeDict = ref([]);

function handleSelect(item) {
  emit('select', item);
}

onMounted(async () => {
  try {
    outTypeDict.value = await dictStore.get('DC_WMS_OUT_TYPE_WMS');
  } catch (error) {
    console.error('获取出库类型字典失败', error);
  }
});

function renderOutType(value) {
  const option = outTypeDict.value.find((item) => item.value === value);
  return option?.label ?? '—';
}

const fetcher = async ({ pageNo, pageSize, keyword }) => {
  const params = {
    current: pageNo,
    size: pageSize,
    outStockStatus: 'DC_WMS_OUT_STATUS_MPC',
  };

  const code = (keyword ?? '').toString().trim();
  if (code) params.outStockCode = code;

  const res = await Api.wms?.wmsOutStock?.list(params);
  const payload = res?.data ?? res;
  const { code: respCode, data } = payload ?? {};

  if (respCode !== 200 || !data) {
    showFailToast('获取待确认单据失败');
    throw new Error('请求失败');
  }

  return data;
};
</script>

<style scoped>
.pending-list {
  flex: 1;
  min-height: 0;
}

.pending-card {
  position: relative;
  background: #fff;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
}

.pending-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.pending-card__header .title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2939;
}

.pending-card__header .badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f4f4f5;
  color: #475467;
}

.pending-card__body {
  font-size: 13px;
  color: #475467;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pending-card__body .row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.pending-card__body .label {
  color: #98a2b3;
}

.pending-card__icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #98a2b3;
}
</style>
