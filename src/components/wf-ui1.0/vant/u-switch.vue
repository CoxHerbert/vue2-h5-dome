<template>
  <van-switch
    v-model="innerValue"
    :active-color="activeColor"
    :inactive-color="inactiveColor"
    :active-value="activeValue"
    :inactive-value="inactiveValue"
    :disabled="disabled"
    @change="(val) => emit('change', val)"
  />
</template>

<script setup>
import { ref, watch } from 'vue';

defineOptions({
  name: 'u-switch',
});

const props = defineProps({
  modelValue: {
    type: [Boolean, String, Number],
    default: false,
  },
  activeColor: {
    type: String,
    default: '#1989fa',
  },
  inactiveColor: {
    type: String,
    default: '#dcdcdc',
  },
  activeValue: {
    type: [Boolean, String, Number],
    default: true,
  },
  inactiveValue: {
    type: [Boolean, String, Number],
    default: false,
  },
  disabled: Boolean,
});

const emit = defineEmits(['update:modelValue', 'change']);

const innerValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    innerValue.value = val;
  },
);

watch(innerValue, (val) => {
  emit('update:modelValue', val);
});
</script>
