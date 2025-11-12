<template>
  <div class="wf-slider">
    <u-slider
      v-model="sliderValue"
      :range="!!column.range"
      :min="column.min || 0"
      :max="column.max || 100"
      :step="stepValue"
      :show-value="!!column.showValue"
      :active-color="column.activeColor"
      :inactive-color="column.backgroundColor"
      :disabled="disabled"
      @change="handleChange"
    ></u-slider>
    <span v-if="showDisplay" class="wf-slider__text">{{ displayValue }}</span>
  </div>
</template>

<script>
import Props from '../../mixins/props.js';

export default {
  name: 'wf-slider',
  mixins: [Props],
  data() {
    return {
      sliderValue: this.column.range ? [0, 0] : 0,
    };
  },
  computed: {
    stepValue() {
      if (typeof this.column.step === 'number' && this.column.step > 0) {
        return this.column.step;
      }
      return 1;
    },
    showDisplay() {
      return this.column.showText !== false;
    },
    displayValue() {
      if (Array.isArray(this.sliderValue)) {
        return this.sliderValue.join(',');
      }
      return this.sliderValue;
    },
  },
  watch: {
    text: {
      handler(val) {
        this.sliderValue = this.normalizeValue(val);
      },
      immediate: true,
    },
    sliderValue: {
      handler(val) {
        this.text = Array.isArray(val) ? val.slice() : val;
      },
      deep: true,
    },
  },
  methods: {
    normalizeValue(val) {
      if (this.column.range) {
        if (Array.isArray(val)) {
          return val.map((item) => Number(item) || 0);
        }
        if (typeof val === 'string') {
          const parts = val.split(',');
          return [Number(parts[0]) || 0, Number(parts[1]) || 0];
        }
        return [0, 0];
      }
      const numeric = Number(Array.isArray(val) ? val[0] : val);
      return Number.isNaN(numeric) ? 0 : numeric;
    },
    handleChange(val) {
      this.text = Array.isArray(val) ? val.slice() : val;
    },
  },
};
</script>

<style lang="scss" scoped>
.wf-slider {
  display: flex;
  align-items: center;
  width: 100%;

  &__text {
    margin-left: 8px;
    color: #606266;
    font-size: 14px;
    white-space: nowrap;
  }
}
</style>
