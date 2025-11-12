<template>
  <van-radio-group v-model="innerValue" :disabled="disabled" @change="onChange">
    <slot />
  </van-radio-group>
</template>

<script>
import { RadioGroup } from 'vant';

export default {
  name: 'u-radio-group',
  components: { VanRadioGroup: RadioGroup },
  props: {
    modelValue: {
      type: [String, Number],
      default: undefined,
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
    onChange(value) {
      this.$emit('change', value);
    },
  },
};
</script>
