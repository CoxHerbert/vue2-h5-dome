<template>
  <van-button
    :type="props.type"
    :size="props.size"
    :plain="props.plain"
    :round="props.round"
    :block="props.block"
    :hairline="props.hairline"
    :loading="props.loading"
    :disabled="props.disabled"
    @click="(event) => emit('click', event)"
  >
    <slot />
  </van-button>
</template>

<script setup>
defineOptions({
  name: 'u-button',
});

const props = defineProps({
  type: {
    type: String,
    default: 'primary',
  },
  size: {
    type: String,
    default: 'normal',
  },
  plain: Boolean,
  round: Boolean,
  block: Boolean,
  hairline: Boolean,
  loading: Boolean,
  disabled: Boolean,
});

const emit = defineEmits(['click']);
</script>
