<template>
  <van-checkbox v-model="innerValue" :name="name" :disabled="disabled">
    <slot />
  </van-checkbox>
</template>

<script>
import { Checkbox } from 'vant';

export default {
  name: 'u-checkbox',
  components: { VanCheckbox: Checkbox },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    name: {
      type: [String, Number],
      required: true,
    },
    disabled: Boolean,
  },
  emits: ['update:modelValue'],
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
};
</script>
