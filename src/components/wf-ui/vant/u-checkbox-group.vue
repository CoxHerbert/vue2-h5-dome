<template>
  <van-checkbox-group v-model="innerValue" :disabled="disabled" @change="onChange">
    <slot />
  </van-checkbox-group>
</template>

<script>
import { CheckboxGroup } from 'vant';

export default {
  name: 'u-checkbox-group',
  components: { VanCheckboxGroup: CheckboxGroup },
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    disabled: Boolean,
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return { innerValue: this.modelValue.slice() };
  },
  watch: {
    modelValue(val) {
      this.innerValue = Array.isArray(val) ? val.slice() : [];
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
