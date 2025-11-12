<template>
  <van-popup
    v-model:show="visible"
    :position="position"
    :round="round"
    :closeable="closeable"
    :close-icon="closeIcon"
    :safe-area-inset-bottom="safeAreaInsetBottom"
    @close="handleClose"
  >
    <slot />
  </van-popup>
</template>

<script>
import { Popup } from 'vant';

export default {
  name: 'u-popup',
  components: { VanPopup: Popup },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: 'bottom',
    },
    round: Boolean,
    closeable: Boolean,
    closeIcon: {
      type: String,
      default: 'cross',
    },
    safeAreaInsetBottom: Boolean,
  },
  emits: ['update:modelValue', 'close'],
  computed: {
    position() {
      if (this.mode === 'bottom') return 'bottom';
      if (this.mode === 'top') return 'top';
      if (this.mode === 'left') return 'left';
      if (this.mode === 'right') return 'right';
      return 'center';
    },
    visible: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
  },
  methods: {
    handleClose() {
      this.$emit('close');
    },
  },
};
</script>
