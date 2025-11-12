<template>
  <div class="wf-rate">
    <u-rate
      v-model="score"
      :count="column.max || 5"
      :size="column.size || 20"
      :active-color="activeColor"
      :void-color="voidColor"
      :allow-half="!!column.allowHalf"
      :disabled="disabled"
    ></u-rate>
    <span v-if="displayText" class="wf-rate__text">{{ displayText }}</span>
  </div>
</template>

<script>
import Props from '../../mixins/props.js';

export default {
  name: 'wf-rate',
  mixins: [Props],
  data() {
    return {
      score: 0,
    };
  },
  computed: {
    activeColor() {
      const { colors } = this.column;
      if (Array.isArray(colors)) {
        return colors[1] || colors[0] || '#ffd21e';
      }
      if (colors && typeof colors === 'object') {
        return colors.active || colors.selected || '#ffd21e';
      }
      if (typeof colors === 'string') return colors;
      return '#ffd21e';
    },
    voidColor() {
      const { colors } = this.column;
      if (Array.isArray(colors)) {
        return colors[0] || '#c8c9cc';
      }
      if (colors && typeof colors === 'object') {
        return colors.void || colors.inactive || '#c8c9cc';
      }
      return '#c8c9cc';
    },
    displayText() {
      if (this.column.showText && Array.isArray(this.column.texts)) {
        const index = Math.max(0, Math.round(this.score) - 1);
        return this.column.texts[index] || '';
      }
      if (this.column.showScore && !this.column.showText) {
        return this.score;
      }
      return '';
    },
  },
  watch: {
    text: {
      handler(val) {
        const numeric = Number(val);
        this.score = Number.isNaN(numeric) ? 0 : numeric;
      },
      immediate: true,
    },
    score(val) {
      this.text = val;
    },
  },
};
</script>

<style lang="scss" scoped>
.wf-rate {
  display: inline-flex;
  align-items: center;

  &__text {
    margin-left: 8px;
    font-size: 14px;
    color: #606266;
  }
}
</style>
