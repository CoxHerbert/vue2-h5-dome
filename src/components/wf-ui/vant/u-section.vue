<template>
  <div class="u-section" :style="sectionStyle" @click="$emit('click')">
    <div v-if="showLine" class="u-section__line" :style="lineStyle"></div>
    <div class="u-section__title" :style="titleStyle">
      <slot>{{ title }}</slot>
    </div>
    <div class="u-section__right">
      <slot name="right" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'u-section',
  props: {
    title: {
      type: String,
      default: '',
    },
    fontSize: {
      type: [Number, String],
      default: 28,
    },
    color: {
      type: String,
      default: '#303133',
    },
    showLine: {
      type: Boolean,
      default: true,
    },
    lineColor: {
      type: String,
      default: '#1989fa',
    },
    backgroundColor: {
      type: String,
      default: 'transparent',
    },
    padding: {
      type: String,
      default: '0',
    },
  },
  emits: ['click'],
  computed: {
    titleStyle() {
      return {
        fontSize: typeof this.fontSize === 'number' ? `${this.fontSize}rpx` : this.fontSize,
        color: this.color,
      };
    },
    lineStyle() {
      return {
        backgroundColor: this.lineColor,
      };
    },
    sectionStyle() {
      return {
        background: this.backgroundColor,
        padding: this.padding,
      };
    },
  },
};
</script>

<style scoped>
.u-section {
  display: flex;
  align-items: center;
}
.u-section__line {
  width: 8rpx;
  height: 32rpx;
  border-radius: 4rpx;
  margin-right: 16rpx;
}
.u-section__title {
  flex: 1;
  font-weight: 600;
}
</style>
