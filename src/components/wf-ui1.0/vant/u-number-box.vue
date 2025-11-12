<template>
  <van-stepper
    v-model="innerValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :integer="integer"
    :decimal-length="decimalLength"
    @change="(val) => emit('change', val)"
  />
</template>

<script setup>
import { ref, watch } from 'vue';

defineOptions({
  name: 'u-number-box',
});

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: 0,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: Number.MAX_SAFE_INTEGER,
  },
  step: {
    type: Number,
    default: 1,
  },
  integer: {
    type: Boolean,
    default: true,
  },
  decimalLength: {
    type: Number,
    default: 0,
  },
  disabled: Boolean,
});

const emit = defineEmits(['update:modelValue', 'change']);

const innerValue = ref(Number(props.modelValue) || 0);

watch(
  () => props.modelValue,
  (val) => {
    innerValue.value = Number(val) || 0;
  },
);

watch(innerValue, (val) => {
  emit('update:modelValue', val);
});
</script>
