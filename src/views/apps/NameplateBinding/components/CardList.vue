<template>
  <div class="nameplate-card">
    <div class="nameplate-card__header">
      <van-icon name="label-o" size="24" />
      <span class="nameplate-card__title">Name: {{ list.materialName || '-' }}</span>
    </div>

    <div class="nameplate-card__body">
      <div class="nameplate-card__info">
        <div class="info-row">
          <span class="label">P.Code:</span>
          <span class="value">{{ list.materialNum || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">SN:</span>
          <span class="value">{{ list.code || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">铭牌:</span>
          <span class="value" :class="{ 'value--success': hasNameplate, 'value--warning': !hasNameplate }">
            {{ nameplateText }}
          </span>
        </div>
        <div class="info-row">
          <span class="label">专案号:</span>
          <span class="value">{{ list.mtoNo || '-' }}</span>
        </div>
      </div>
      <van-tag v-if="list.code" type="primary" plain>{{ list.code }}</van-tag>
    </div>

    <van-divider />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  list: {
    type: Object,
    default: () => ({}),
  },
});

const nameplateText = computed(() => {
  if (!props.list) return '当前铭牌不存在';
  return props.list.bindCustomerNameplate || '当前铭牌不存在';
});

const hasNameplate = computed(() => Boolean(props.list?.bindCustomerNameplate));
</script>

<style scoped lang="scss">
.nameplate-card {
  background-color: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 16px;
    color: #333;
  }

  &__body {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 14px;
  }

  &__title {
    flex: 1;
  }
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;

  .label {
    color: #666;
    min-width: 72px;
  }

  .value {
    color: #333;
    word-break: break-all;
  }

  .value--success {
    color: #07c160;
  }

  .value--warning {
    color: #ee0a24;
  }
}
</style>
