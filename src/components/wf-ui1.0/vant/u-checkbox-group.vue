<template>
  <van-checkbox-group
    v-model="innerValue"
    :max="max"
    :disabled="disabled"
    :direction="direction"
    @change="(val) => emit('change', val)"
  >
    <slot />
  </van-checkbox-group>
</template>

<script setup>
import { ref, watch } from 'vue';

defineOptions({
  name: 'u-checkbox-group',
});

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  max: {
    type: Number,
    default: 0,
  },
  disabled: Boolean,
  direction: {
    type: String,
    default: 'vertical',
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

const innerValue = ref(props.modelValue.slice());

watch(
  () => props.modelValue,
  (val) => {
    innerValue.value = Array.isArray(val) ? val.slice() : [];
  },
  { deep: true },
);

watch(
  innerValue,
  (val) => {
    emit('update:modelValue', val);
  },
  { deep: true },
);
</script>
