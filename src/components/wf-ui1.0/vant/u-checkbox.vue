<template>
  <van-checkbox
    :name="name"
    :shape="shape"
    :disabled="disabled"
    :label-disabled="labelDisabled"
    :icon-size="iconSize"
    v-model:checked="innerChecked"
  >
    <slot />
  </van-checkbox>
</template>

<script setup>
import { computed } from 'vue';

defineOptions({
  name: 'u-checkbox',
});

const props = defineProps({
  name: {
    type: [String, Number, Boolean],
    required: true,
  },
  shape: {
    type: String,
    default: 'square',
  },
  disabled: Boolean,
  labelDisabled: Boolean,
  iconSize: {
    type: [Number, String],
    default: 20,
  },
  modelValue: {
    type: Boolean,
    default: undefined,
  },
  checked: {
    type: Boolean,
    default: undefined,
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

const innerChecked = computed({
  get() {
    return props.modelValue ?? props.checked ?? false;
  },
  set(val) {
    emit('update:modelValue', val);
    emit('change', val);
  },
});
</script>
