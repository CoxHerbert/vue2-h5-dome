<template>
  <van-switch v-model="innerValue" :disabled="disabled" @change="onChange" />
</template>

<script>
import { Switch } from 'vant';

export default {
  name: 'u-switch',
  components: { VanSwitch: Switch },
  props: {
    modelValue: {
      type: [Boolean, Number, String],
      default: false,
    },
    disabled: Boolean,
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
