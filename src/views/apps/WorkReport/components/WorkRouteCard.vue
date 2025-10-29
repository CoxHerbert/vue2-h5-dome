<template>
  <div class="work-route-card">
    <div class="work-route-card__header">
      <div class="work-route-card__title">工艺 / Quy trình: {{ route.produceRouteName || '-' }}</div>
      <div class="work-route-card__switch">
        <span>标记完工 / Đánh dấu hoàn thành:</span>
        <van-switch :model-value="Boolean(route.isComplete)" size="20" @change="handleCompleteChange" />
      </div>
    </div>

    <div class="work-route-card__body">
      <div v-for="material in route.children || []" :key="material.id" class="work-route-card__group">
        <div class="work-route-card__group-title">{{ material.materialName || '-' }}</div>
        <div class="work-route-card__row">
          <span class="work-route-card__label">计划单号 / Mã kế hoạch:</span>
          <span class="work-route-card__value">{{ material.billNumber || '-' }}</span>
        </div>
        <div class="work-route-card__row">
          <span class="work-route-card__label">工时统计 / Thống kê giờ:</span>
          <span class="work-route-card__value">
            {{ formatHour(material.reportWorkingHours) }}/{{ formatHour(material.processTime) }}时 / giờ
          </span>
        </div>
        <div class="work-route-card__row">
          <span class="work-route-card__label">数量工时 / Số lượng giờ:</span>
          <span class="work-route-card__value">
            {{ toNumber(material.reportNumber) }}/{{ toNumber(material.number) }}个 / cái
          </span>
        </div>
        <div class="work-route-card__edit">
          <div class="work-route-card__field">
            <span class="work-route-card__label">工时 / Giờ:</span>
            <van-stepper
              :model-value="material.reportHour"
              :min="0"
              :step="0.1"
              :decimal-length="3"
              @change="(value) => handleHourChange(material.id, value)"
            />
          </div>
          <div class="work-route-card__field">
            <span class="work-route-card__label">数量 / Số lượng:</span>
            <van-stepper
              integer
              :model-value="material.reportQty"
              :min="0"
              :max="Math.max(toNumber(material.number) - toNumber(material.reportNumber), 0)"
              @change="(value) => handleQtyChange(material.id, value)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  route: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['toggle-complete', 'change-report-hour', 'change-report-qty']);

const formatHour = (seconds) => {
  const value = Number(seconds);
  if (!value) return '0';
  const hours = value / 3600;
  if (!Number.isFinite(hours)) return '0';
  return Number(hours.toFixed(2)).toString();
};

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const handleCompleteChange = (value) => {
  emit('toggle-complete', { routeId: props.route?.produceRouteId, value });
};

const handleHourChange = (materialId, value) => {
  emit('change-report-hour', { routeId: props.route?.produceRouteId, materialId, value });
};

const handleQtyChange = (materialId, value) => {
  emit('change-report-qty', { routeId: props.route?.produceRouteId, materialId, value });
};
</script>

<style scoped lang="scss">
.work-route-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 8px;
  }

  &__title {
    font-weight: 600;
    font-size: 15px;
    color: #1f1f1f;
  }

  &__switch {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #646566;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 13px;
    color: #4c4c4c;
  }

  &__group-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f1f1f;
  }

  &__row {
    display: flex;
    line-height: 1.5;
  }

  &__label {
    width: 90px;
    font-weight: 600;
    color: #1f1f1f;
  }

  &__value {
    flex: 1;
    word-break: break-all;
  }

  &__edit {
    display: flex;
    gap: 16px;
    padding-top: 8px;
    border-top: 1px dashed #e8e8e8;
  }

  &__field {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
