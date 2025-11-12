<template>
  <div class="wf-number">
    <u-number-box
      v-model="number"
      :min="minValue"
      :max="maxValue"
      :step="stepValue"
      :integer="decimalLength === 0"
      :decimal-length="decimalLength"
      :disabled="disabled"
      @click="handleClick"
      @focus="handleFocus"
      @blur="handleBlur"
    ></u-number-box>
  </div>
</template>

<script>
import Props from '../../mixins/props.js';

export default {
  name: 'wf-number',
  mixins: [Props],
  data() {
    return {
      number: undefined,
    };
  },
  computed: {
    minValue() {
      return typeof this.column.min === 'number' ? this.column.min : 0;
    },
    maxValue() {
      return typeof this.column.max === 'number' ? this.column.max : 99999;
    },
    stepValue() {
      return typeof this.column.step === 'number' && this.column.step > 0
        ? this.column.step
        : 1;
    },
    decimalLength() {
      if (typeof this.column.decimalLength === 'number') {
        return Math.max(0, this.column.decimalLength);
      }
      if (this.column.precision !== undefined) {
        return Math.max(0, Number(this.column.precision) || 0);
      }
      return 0;
    },
  },
  watch: {
    text: {
      handler(val) {
        const numeric = Number(val);
        this.number = Number.isNaN(numeric) ? undefined : numeric;
      },
      immediate: true,
    },
    number(val) {
      this.text = val;
    },
  },
};
</script>

<style lang="scss" scoped>
.wf-number {
  width: 100%;
}
</style>
