<template>
  <van-field
    v-model="innerValue"
    :label="label"
    :label-width="labelWidth"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :input-align="inputAlign"
    :maxlength="maxlength"
    :type="type"
    :border="borderBottom"
    :placeholder-style="placeholderStyle"
  >
    <template #input>
      <slot />
    </template>
    <template #left-icon>
      <slot name="icon" />
    </template>
  </van-field>
</template>

<script>
import { Field } from 'vant';

export default {
  name: 'u-field',
  components: { VanField: Field },
  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
    label: String,
    labelWidth: {
      type: [Number, String],
      default: '6em',
    },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    inputAlign: String,
    maxlength: [Number, String],
    type: {
      type: String,
      default: 'text',
    },
    borderBottom: {
      type: Boolean,
      default: true,
    },
    placeholderStyle: String,
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
