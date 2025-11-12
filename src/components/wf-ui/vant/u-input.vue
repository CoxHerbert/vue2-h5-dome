<template>
  <van-field
    v-model="innerValue"
    :type="type"
    :maxlength="maxlength"
    :placeholder="placeholder"
    :disabled="disabled"
    :autosize="autosize"
    :rows="rows"
    :readonly="readonly"
    :clearable="clearable"
    :show-word-limit="showWordLimit"
    :formatter="formatter"
    @focus="onFocus"
    @blur="onBlur"
    @click="onClick"
  />
</template>

<script>
import { Field } from 'vant';

export default {
  name: 'u-input',
  components: { VanField: Field },
  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    maxlength: {
      type: [Number, String],
      default: 140,
    },
    placeholder: String,
    disabled: Boolean,
    height: [Number, String],
    border: Boolean,
    autosize: {
      type: [Boolean, Object],
      default: undefined,
    },
    rows: {
      type: [Number, String],
      default: undefined,
    },
    readonly: Boolean,
    clearable: {
      type: Boolean,
      default: true,
    },
    showWordLimit: Boolean,
    formatter: Function,
  },
  emits: ['update:modelValue', 'focus', 'blur', 'click'],
  data() {
    return {
      innerValue: this.modelValue,
    };
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
    onFocus(event) {
      this.$emit('focus', event);
    },
    onBlur(event) {
      this.$emit('blur', event);
    },
    onClick(event) {
      this.$emit('click', event);
    },
  },
};
</script>
