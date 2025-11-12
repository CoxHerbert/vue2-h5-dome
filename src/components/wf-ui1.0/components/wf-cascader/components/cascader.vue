<template>
  <van-cascader
    v-model="innerValue"
    :options="itemList"
    :title="title"
    :field-names="fieldNames"
    v-bind="cascaderOptions"
    @finish="handleFinish"
  />
</template>

<script>
import { DIC_PROPS } from '../../../util/variable.js';

export default {
  name: 'wf-cascader-panel',
  props: {
    title: {
      type: String,
      default: '',
    },
    props: {
      type: Object,
      default: () => ({}),
    },
    itemList: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['complete'],
  data() {
    return {
      innerValue: undefined,
    };
  },
  computed: {
    cascaderProps() {
      return { ...DIC_PROPS, ...(this.props || {}) };
    },
    fieldNames() {
      const { label, value, children } = this.cascaderProps;
      return {
        text: label,
        value,
        children,
      };
    },
    cascaderOptions() {
      const { label, value, children, desc, ...rest } = this.cascaderProps;
      return rest;
    },
    valueKey() {
      return this.cascaderProps.value;
    },
    labelKey() {
      return this.cascaderProps.label;
    },
    descKey() {
      return this.cascaderProps.desc;
    },
  },
  watch: {
    itemList: {
      immediate: true,
      handler() {
        this.innerValue = undefined;
      },
    },
  },
  methods: {
    handleFinish({ value, selectedOptions }) {
      this.innerValue = value;
      const result = (selectedOptions || []).map((option) => {
        const cloned = { ...option };
        delete cloned.children;
        return cloned;
      });
      const last = result[result.length - 1] || {};
      const labels = result.map((item) => item[this.labelKey]).filter(Boolean).join('/');
      this.$emit('complete', {
        result,
        [this.valueKey]: last[this.valueKey] ?? value,
        [this.labelKey]: labels,
        [this.descKey]: last[this.descKey],
        src: last.src,
      });
    },
  },
};
</script>
