<template>
  <van-slider
    v-model="innerValue"
    :range="isRange"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :show-value="showValue"
    :active-color="activeColor"
    :inactive-color="inactiveColor"
    :bar-height="barHeight"
    :button-size="buttonSize"
    @change="(val) => emit('change', val)"
  />
</template>

<script setup>
import { computed, ref, watch } from 'vue';

defineOptions({
  name: 'u-slider',
});

const props = defineProps({
  modelValue: {
    type: [Number, String, Array],
    default: 0,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  step: {
    type: Number,
    default: 1,
  },
  showValue: Boolean,
  disabled: Boolean,
  range: Boolean,
  activeColor: String,
  inactiveColor: String,
  barHeight: {
    type: [Number, String],
    default: undefined,
  },
  buttonSize: {
    type: [Number, String],
    default: undefined,
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

const isRange = computed(() => props.range || Array.isArray(props.modelValue));

const normalizeValue = (val) => {
  if (isRange.value) {
    if (Array.isArray(val)) {
      return val.map((item) => Number(item) || 0);
    }
    if (typeof val === 'string') {
      const [start, end] = val.split(',');
      return [Number(start) || 0, Number(end) || 0];
    }
    const numeric = Number(val);
    if (Number.isNaN(numeric)) {
      return [props.min, props.min];
    }
    return [numeric, numeric];
  }
  const numeric = Number(Array.isArray(val) ? val[0] : val);
  return Number.isNaN(numeric) ? 0 : numeric;
};

const innerValue = ref(normalizeValue(props.modelValue));

watch(
  () => props.modelValue,
  (val) => {
    innerValue.value = normalizeValue(val);
  },
  { deep: true },
);

watch(
  () => props.range,
  () => {
    innerValue.value = normalizeValue(props.modelValue);
  },
);

watch(innerValue, (val) => {
  emit('update:modelValue', Array.isArray(val) ? val.map((item) => item) : val);
});

const activeColor = computed(() => props.activeColor || undefined);
const inactiveColor = computed(() => props.inactiveColor || undefined);
const barHeight = computed(() => props.barHeight);
const buttonSize = computed(() => props.buttonSize);
</script>
