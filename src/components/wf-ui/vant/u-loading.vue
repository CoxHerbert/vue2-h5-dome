<template>
  <div class="u-loading">
    <van-loading :type="resolvedType" :size="size" :color="color">
      <slot>{{ text }}</slot>
    </van-loading>
  </div>
</template>

<script>
import { Loading } from 'vant';

export default {
  name: 'u-loading',
  components: { VanLoading: Loading },
  props: {
    mode: {
      type: String,
      default: 'spinner',
    },
    size: {
      type: [Number, String],
      default: 30,
    },
    color: {
      type: String,
      default: '#1989fa',
    },
    text: {
      type: String,
      default: '',
    },
  },
  computed: {
    resolvedType() {
      if (this.mode === 'circle') return 'circular';
      if (this.mode === 'flower') return 'spinner';
      return this.mode;
    },
  },
};
</script>

<style scoped>
.u-loading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
