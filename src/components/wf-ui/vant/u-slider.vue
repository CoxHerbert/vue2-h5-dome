<template>
  <van-slider
    v-model="innerValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :bar-height="barHeight"
    @change="onChange"
  />
</template>

<script>
import { Slider } from 'vant';

export default {
  name: 'u-slider',
  components: { VanSlider: Slider },
  props: {
    modelValue: {
      type: [Number, Array],
      default: 0,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    step: {
      type: Number,
      default: 1,
    },
    disabled: Boolean,
    barHeight: {
      type: [Number, String],
      default: 4,
    },
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
