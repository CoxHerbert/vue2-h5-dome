<template>
  <van-rate v-model="innerValue" :count="count" :size="size" :disabled="disabled" :allow-half="allowHalf" @change="onChange" />
</template>

<script>
import { Rate } from 'vant';

export default {
  name: 'u-rate',
  components: { VanRate: Rate },
  props: {
    modelValue: {
      type: Number,
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
    disabled: Boolean,
    allowHalf: Boolean,
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return { innerValue: this.modelValue };
  },
  watch: {
    modelValue(val) {
      this.innerValue = val;
    },
    innerValue(val) {
      this.$emit('update:modelValue', val);
    },
  },
  methods: {
    onChange(val) {
      this.$emit('change', val);
    },
  },
};
</script>
