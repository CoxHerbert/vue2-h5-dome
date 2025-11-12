<template>
  <van-rate
    v-model="innerValue"
    :count="count"
    :size="size"
    :color="activeColor"
    :void-color="voidColor"
    :disabled="disabled"
    :allow-half="allowHalf"
    @change="(val) => emit('change', val)"
  />
</template>

<script setup>
import { ref, watch } from 'vue';

defineOptions({
  name: 'u-rate',
});

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: 0,
  },
  count: {
    type: Number,
    default: 5,
  },
  size: {
    type: [Number, String],
    default: 20,
  },
  activeColor: {
    type: String,
    default: '#ffd21e',
  },
  voidColor: {
    type: String,
    default: '#c8c9cc',
  },
  allowHalf: Boolean,
  disabled: Boolean,
});

const emit = defineEmits(['update:modelValue', 'change']);

const innerValue = ref(Number(props.modelValue));

watch(
  () => props.modelValue,
  (val) => {
    innerValue.value = Number(val);
  },
);

watch(innerValue, (val) => {
  emit('update:modelValue', val);
});
</script>
