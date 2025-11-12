<template>
  <van-slider
    v-model="innerValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :show-value="showValue"
    @change="(val) => emit('change', val)"
  />
</template>

<script setup>
import { ref, watch } from 'vue';

defineOptions({
  name: 'u-slider',
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
    default: 100,
  },
  step: {
    type: Number,
    default: 1,
  },
  showValue: Boolean,
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
