<template>
  <div class="page inbound-order-list">
    <van-nav-bar
      fixed
      :z-index="999"
      title="入库单"
      left-arrow
      :style="{ background: '#F7EEE8' }"
      @click-left="goBack"
    />

    <div class="page-body">
      <div class="toolbar">
        <div class="toolbar__meta">
          <span class="toolbar__label">入库单数量</span>
          <span class="toolbar__value">{{ displayOrders.length }}</span>
        </div>
        <div class="toolbar__meta">
          <span class="toolbar__label">总明细</span>
          <span class="toolbar__value">{{ totalCount }}</span>
        </div>
        <van-button type="primary" size="small" class="toolbar__button" @click="handleCreate">
          <van-icon name="plus" size="16" /> 新增入库单
        </van-button>
      </div>

      <van-pull-refresh v-model="refreshing" class="list-wrapper" @refresh="onRefresh">
        <template v-if="displayOrders.length">
          <div
            v-for="order in displayOrders"
            :key="order.id"
            class="order-card"
            @click="openDetail(order.id)"
          >
            <div class="order-card__header">
              <div class="order-card__title">{{ order.inboundNo }}</div>
              <van-tag :type="getStatus(order).type">{{ getStatus(order).label }}</van-tag>
            </div>
            <div class="order-card__meta">
              <span>库位：{{ order.locatorNo || '-' }}</span>
              <span>创建人：{{ order.createdBy }}</span>
            </div>
            <div class="order-card__meta">
              <span>创建时间：{{ order.createdAt }}</span>
              <span>明细：{{ order.items.length }} 条</span>
            </div>
            <div class="order-card__footer">
              <div class="order-card__footer-item">
                <span class="label">图档数量合计</span>
                <span class="value">{{ sumDrawQty(order.items) }}</span>
              </div>
              <div class="order-card__footer-item">
                <span class="label">备注</span>
                <span class="value">{{ order.remark || '-' }}</span>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <van-empty description="暂无入库单">
            <van-button round type="primary" @click="handleCreate">新增入库单</van-button>
          </van-empty>
        </template>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import useInboundOrders from '@/composables/useInboundOrders';

const router = useRouter();
const { orders, totalCount } = useInboundOrders();
const refreshing = ref(false);

const displayOrders = computed(() =>
  [...orders.value].sort(
    (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
  )
);

const goBack = () => {
  router.back();
};

const handleCreate = () => {
  router.push({ name: 'appsInboundOrderCreate' });
};

const openDetail = (id) => {
  router.push({ name: 'appsInboundOrderDetail', params: { id } });
};

const sumDrawQty = (items = []) =>
  items.reduce((acc, item) => acc + Number(item.drawQty ?? 0), 0);

const getStatus = (order) => {
  const hasException = order.items.some((item) => item.isQualified === '0');
  return hasException
    ? { label: '存在异常', type: 'danger' }
    : { label: '全部合格', type: 'success' };
};

const onRefresh = () => {
  setTimeout(() => {
    refreshing.value = false;
  }, 500);
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f8fa;
}

.page-body {
  padding: 96px 16px 24px;
  box-sizing: border-box;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  margin-bottom: 16px;
}

.toolbar__meta {
  display: flex;
  flex-direction: column;
  background: #fff3e8;
  padding: 8px 12px;
  border-radius: 8px;
}

.toolbar__label {
  font-size: 12px;
  color: #a05c2f;
}

.toolbar__value {
  font-size: 18px;
  font-weight: 600;
  color: #d05507;
}

.toolbar__button {
  margin-left: auto;
}

.list-wrapper {
  min-height: calc(100vh - 168px);
}

.order-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
  margin-bottom: 16px;
}

.order-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-card__title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

.order-card__meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.order-card__footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  display: grid;
  gap: 8px;
}

.order-card__footer-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.order-card__footer-item .label {
  color: #999;
}

.order-card__footer-item .value {
  color: #333;
}
</style>
