<template>
  <van-stepper v-model="innerValue" :min="min" :max="max" :step="step" :disabled="disabled" @change="onChange" />
</template>

<script>
import { Stepper } from 'vant';

export default {
  name: 'u-number-box',
  components: { VanStepper: Stepper },
  props: {
    modelValue: {
      type: [Number, String],
      default: 0,
    },
    min: {
      type: [Number, String],
      default: 0,
    },
    max: {
      type: [Number, String],
      default: Number.MAX_SAFE_INTEGER,
    },
    step: {
      type: [Number, String],
      default: 1,
    },
    disabled: Boolean,
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return { innerValue: Number(this.modelValue) };
  },
  watch: {
    modelValue(val) {
      this.innerValue = Number(val);
    },
    innerValue(val) {
      this.$emit('update:modelValue', val);
    },
  },
  methods: {
    onChange(value) {
      this.$emit('change', value);
    },
  },
};
</script>
