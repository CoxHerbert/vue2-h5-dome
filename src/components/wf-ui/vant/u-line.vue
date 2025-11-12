<template>
  <div :class="lineClass" :style="lineStyle">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'u-line',
  props: {
    direction: {
      type: String,
      default: 'row',
    },
    color: {
      type: String,
      default: '#ebedf0',
    },
    length: {
      type: [Number, String],
      default: '100%',
    },
    borderStyle: {
      type: String,
      default: 'solid',
    },
    hairline: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    lineClass() {
      return [
        'u-line',
        this.direction === 'col' ? 'u-line--vertical' : 'u-line--horizontal',
      ];
    },
    lineStyle() {
      const size = this.hairline ? '1px' : '2px';
      if (this.direction === 'col') {
        return {
          width: size,
          height: typeof this.length === 'number' ? `${this.length}px` : this.length,
          backgroundColor: this.color,
        };
      }
      return {
        height: size,
        width: typeof this.length === 'number' ? `${this.length}px` : this.length,
        backgroundColor: this.color,
      };
    },
  },
};
</script>

<style scoped>
.u-line {
  display: flex;
}
.u-line--horizontal {
  width: 100%;
}
.u-line--vertical {
  height: 100%;
}
</style>
