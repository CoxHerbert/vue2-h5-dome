<template>
  <div class="u-form-item" :class="[`label-${labelPosition}`]">
    <label v-if="label" class="u-form-item__label" :style="labelStyles">
      <span v-if="required" class="u-form-item__required">*</span>{{ label }}
    </label>
    <div class="u-form-item__content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  labelWidth: {
    type: [String, Number],
    default: undefined,
  },
  labelPosition: {
    type: String,
    default: 'left',
  },
  required: {
    type: Boolean,
    default: false,
  },
});

const labelStyles = computed(() => {
  if (!props.labelWidth) return undefined;
  const width = typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth;
  return { width };
});
</script>

<style scoped>
.u-form-item {
  display: flex;
  flex-direction: row;
  margin-bottom: 16px;
}

.u-form-item.label-top {
  flex-direction: column;
}

.u-form-item__label {
  font-size: 14px;
  color: #323233;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.u-form-item.label-left .u-form-item__label {
  margin-bottom: 0;
  margin-right: 16px;
  justify-content: flex-end;
}

.u-form-item__required {
  color: #ee0a24;
  margin-right: 4px;
}

.u-form-item__content {
  flex: 1;
}
</style>
