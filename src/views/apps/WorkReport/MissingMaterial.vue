<template>
  <div class="missing-material page">
    <dc-nav-bar title="缺料明细" fixed left-arrow @click-left="handleBack" />

    <div class="missing-material__content">
      <div v-if="dataList.length" class="missing-material__table">
        <div class="missing-material__row missing-material__row--head">
          <span class="col-index">序号</span>
          <span class="col-code">物料编码</span>
          <span class="col-name">物料名称</span>
          <span class="col-qty">库存/需求</span>
          <span class="col-date">预计交货日</span>
        </div>
        <div v-for="(item, index) in dataList" :key="item.id || index" class="missing-material__row">
          <span class="col-index">{{ index + 1 }}</span>
          <span class="col-code">{{ item.materialCode || '-' }}</span>
          <span class="col-name">{{ item.materialName || '-' }}</span>
          <span class="col-qty">{{ formatNumber(item.completeQty) }}/{{ formatNumber(item.qty) }}</span>
          <span class="col-date">{{ item.deliveryDate || '-' }}</span>
        </div>
      </div>
      <van-empty v-else description="暂无缺料信息" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showFailToast, showLoadingToast } from 'vant';
import Api from '@/api';

const router = useRouter();
const route = useRoute();
const dataList = ref([]);

const billNumber = ref('');

const formatNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const fetchData = async () => {
  if (!billNumber.value) return;
  const toast = showLoadingToast({ message: '加载中…', duration: 0, forbidClick: true });
  try {
    const res = await Api.application.workReport.workSchedule.getMaterialInfo({
      billNumber: billNumber.value,
    });
    if (res.code === 200 && Array.isArray(res.data)) {
      dataList.value = res.data;
    } else {
      dataList.value = [];
      showFailToast(res.message || '未获取到缺料信息');
    }
  } catch (error) {
    showFailToast(error?.message || '获取失败');
  } finally {
    toast.close();
  }
};

onMounted(() => {
  const queryBillNumber = route.query?.billNumber;
  if (typeof queryBillNumber === 'string' && queryBillNumber) {
    billNumber.value = queryBillNumber;
    fetchData();
  } else {
    showFailToast('缺少单号信息');
  }
});

const handleBack = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.missing-material {
  min-height: 100vh;
  background: #f7f8fa;

  &__content {
    padding: calc(72px + var(--van-safe-area-top, 0px)) 16px 24px;
    box-sizing: border-box;
  }

  &__table {
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  &__row {
    display: grid;
    grid-template-columns: 0.7fr 1.4fr 1.4fr 1.2fr 1.2fr;
    padding: 12px;
    font-size: 13px;
    color: #4c4c4c;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    &--head {
      background: #f7f8fa;
      font-weight: 600;
      color: #1f1f1f;
    }

    span {
      word-break: break-word;
    }
  }
}
</style>
