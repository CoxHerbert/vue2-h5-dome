<template>
  <van-radio
    :name="name"
    :label-disabled="labelDisabled"
    :disabled="disabled"
    :icon-size="iconSize"
  >
    <slot />
  </van-radio>
</template>

<script setup>
defineOptions({
  name: 'u-radio',
});

defineProps({
  name: {
    type: [String, Number, Boolean],
    required: true,
  },
  labelDisabled: Boolean,
  disabled: Boolean,
  iconSize: {
    type: [Number, String],
    default: 20,
  },
});
</script>
