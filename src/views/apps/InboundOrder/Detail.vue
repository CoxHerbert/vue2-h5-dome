<template>
  <div class="page inbound-order-detail">
    <van-nav-bar
      fixed
      :z-index="999"
      title="入库单详情"
      left-arrow
      :style="{ background: '#F7EEE8' }"
      @click-left="goBack"
    />

    <div v-if="order" class="page-body">
      <van-cell-group inset>
        <van-cell title="入库单号" :value="order.inboundNo" />
        <van-cell title="库位编码" :value="order.locatorNo || '-'" />
        <van-cell title="创建人" :value="order.createdBy" />
        <van-cell title="创建时间" :value="order.createdAt" />
        <van-cell title="备注" :value="order.remark || '-'" />
      </van-cell-group>

      <div class="section">
        <div class="section__header">
          <h3>入库明细</h3>
          <van-tag :type="status.type">{{ status.label }}</van-tag>
        </div>

        <div v-for="(item, index) in order.items" :key="item.id" class="detail-card">
          <div class="detail-card__header">
            <span class="index">#{{ index + 1 }}</span>
            <span class="material">{{ item.exeMaterialName || '-' }}</span>
          </div>
          <div class="detail-card__grid">
            <div class="grid-item">
              <span class="label">BOM编码</span>
              <span class="value">{{ item.bomNo || '-' }}</span>
            </div>
            <div class="grid-item">
              <span class="label">BOM版本</span>
              <span class="value">{{ item.bomVersion || '-' }}</span>
            </div>
            <div class="grid-item">
              <span class="label">执行单单号</span>
              <span class="value">{{ item.no || '-' }}</span>
            </div>
            <div class="grid-item">
              <span class="label">物料编码</span>
              <span class="value">{{ item.exeMaterialNumber || '-' }}</span>
            </div>
            <div class="grid-item">
              <span class="label">成品物料编码</span>
              <span class="value">{{ item.finishMaterialNumber || '-' }}</span>
            </div>
            <div class="grid-item">
              <span class="label">成品物料名称</span>
              <span class="value">{{ item.finishMaterialName || '-' }}</span>
            </div>
            <div class="grid-item">
              <span class="label">专案号</span>
              <span class="value">{{ item.mtoNo || '-' }}</span>
            </div>
            <div class="grid-item">
              <span class="label">单位</span>
              <span class="value">{{ item.unit || '-' }}</span>
            </div>
            <div class="grid-item">
              <span class="label">图档数量</span>
              <span class="value highlight">{{ item.drawQty }}</span>
            </div>
          </div>
          <div class="detail-card__footer">
            <div>
              <span class="label">是否合格：</span>
              <van-tag :type="item.isQualified === '1' ? 'success' : 'danger'">
                {{ item.isQualified === '1' ? '合格' : '不合格' }}
              </van-tag>
            </div>
            <div>
              <span class="label">异常类型：</span>
              <span class="value">{{ item.execeptionType || '-' }}</span>
            </div>
            <div>
              <span class="label">备注：</span>
              <span class="value">{{ item.remark || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="page-empty">
      <van-empty description="未找到入库单">
        <van-button round type="primary" @click="goBack">返回</van-button>
      </van-empty>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useInboundOrders from '@/composables/useInboundOrders';

const route = useRoute();
const router = useRouter();
const { getOrderById } = useInboundOrders();

const order = computed(() => getOrderById(route.params.id));

const status = computed(() => {
  if (!order.value) {
    return { label: '-', type: 'primary' };
  }
  const hasException = order.value.items.some((item) => item.isQualified === '0');
  return hasException
    ? { label: '存在异常', type: 'danger' }
    : { label: '全部合格', type: 'success' };
});

const goBack = () => {
  router.back();
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
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
}

.section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section__header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.detail-card {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fff7f0;
}

.detail-card:last-of-type {
  margin-bottom: 0;
}

.detail-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.detail-card__header .index {
  font-weight: 600;
  color: #d05507;
}

.detail-card__header .material {
  font-size: 14px;
  color: #333;
}

.detail-card__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  font-size: 13px;
  color: #555;
}

.grid-item {
  display: flex;
  flex-direction: column;
}

.grid-item .label {
  color: #999;
  margin-bottom: 4px;
}

.grid-item .value {
  color: #333;
}

.highlight {
  font-weight: 600;
  color: #d05507;
}

.detail-card__footer {
  margin-top: 16px;
  display: grid;
  gap: 8px;
  font-size: 13px;
}

.detail-card__footer .label {
  color: #999;
}

.page-empty {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
