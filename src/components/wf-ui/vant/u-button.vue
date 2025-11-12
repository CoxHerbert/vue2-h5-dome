<template>
  <van-button
    :type="type"
    :size="size"
    :block="block"
    :loading="loading"
    :disabled="disabled"
    :plain="plain"
    :round="round"
    :style="customStyle"
    @click="handleClick"
  >
    <slot />
  </van-button>
</template>

<script>
import { Button } from 'vant';

export default {
  name: 'u-button',
  components: { VanButton: Button },
  props: {
    type: {
      type: String,
      default: 'primary',
    },
    size: {
      type: String,
      default: 'normal',
    },
    block: Boolean,
    loading: Boolean,
    disabled: Boolean,
    plain: Boolean,
    round: Boolean,
    customStyle: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['click'],
  methods: {
    handleClick(event) {
      this.$emit('click', event);
    },
  },
};
</script>
