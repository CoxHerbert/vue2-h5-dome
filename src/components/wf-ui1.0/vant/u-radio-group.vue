<template>
  <van-radio-group
    v-model="innerValue"
    :disabled="disabled"
    :direction="direction"
    @change="(val) => emit('change', val)"
  >
    <slot />
  </van-radio-group>
</template>

<script setup>
import { ref, watch } from 'vue';

defineOptions({
  name: 'u-radio-group',
});

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: '',
  },
  disabled: Boolean,
  direction: {
    type: String,
    default: 'vertical',
  },
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
