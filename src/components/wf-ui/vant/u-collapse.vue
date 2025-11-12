<template>
  <van-collapse v-model="innerValue" :accordion="accordion">
    <slot />
  </van-collapse>
</template>

<script>
import { Collapse } from 'vant';

export default {
  name: 'u-collapse',
  components: { VanCollapse: Collapse },
  props: {
    value: {
      type: [Array, String, Number],
      default: () => [],
    },
    accordion: Boolean,
  },
  emits: ['input', 'update:value', 'change'],
  data() {
    return { innerValue: this.value };
  },
  watch: {
    value(val) {
      this.innerValue = val;
    },
    innerValue(val) {
      this.$emit('input', val);
      this.$emit('update:value', val);
      this.$emit('change', val);
    },
  },
};
</script>
