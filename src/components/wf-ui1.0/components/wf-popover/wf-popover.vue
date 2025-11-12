<template>
  <div class="wf-popover" :class="{ 'wf-popover--flex-end': flexEnd }">
    <transition name="wf-popover-fade">
      <div
        v-if="show"
        class="wf-popover__panel"
        :class="`wf-popover__panel--${direction}`"
        :style="panelStyle"
      >
        <span v-if="showArrow" class="wf-popover__arrow" :style="arrowStyle"></span>
        <slot />
      </div>
    </transition>
    <van-overlay
      v-if="mask"
      :show="show"
      :z-index="overlayZIndex"
      :custom-style="overlayStyle"
      @click="handleClose"
    />
  </div>
</template>

<script>
export default {
  name: 'wfPopover',
  emits: ['close'],
  props: {
    width: {
      type: [String, Number],
      default: '300rpx',
    },
    radius: {
      type: [String, Number],
      default: '8rpx',
    },
    left: {
      type: [String, Number],
      default: 'auto',
    },
    right: {
      type: [String, Number],
      default: 'auto',
    },
    top: {
      type: [String, Number],
      default: 'auto',
    },
    bottom: {
      type: [String, Number],
      default: 'auto',
    },
    translateX: {
      type: String,
      default: '0',
    },
    translateY: {
      type: String,
      default: '0',
    },
    backgroundColor: {
      type: String,
      default: '#4c4c4c',
    },
    color: {
      type: String,
      default: '#fff',
    },
    borderWidth: {
      type: [String, Number],
      default: '12rpx',
    },
    direction: {
      type: String,
      default: 'top',
      validator: (val) => ['top', 'bottom', 'left', 'right'].includes(val),
    },
    triangleLeft: {
      type: [String, Number],
      default: 'auto',
    },
    triangleRight: {
      type: [String, Number],
      default: 'auto',
    },
    triangleTop: {
      type: [String, Number],
      default: 'auto',
    },
    triangleBottom: {
      type: [String, Number],
      default: 'auto',
    },
    position: {
      type: String,
      default: 'fixed',
    },
    flexEnd: {
      type: Boolean,
      default: false,
    },
    mask: {
      type: Boolean,
      default: true,
    },
    maskBgColor: {
      type: String,
      default: 'rgba(0, 0, 0, 0)',
    },
    show: {
      type: Boolean,
      default: false,
    },
    zIndex: {
      type: Number,
      default: 998,
    },
  },
  computed: {
    panelStyle() {
      return {
        width: this.normalizeSize(this.width),
        backgroundColor: this.backgroundColor,
        borderRadius: this.normalizeSize(this.radius),
        color: this.color,
        position: this.position,
        left: this.normalizePosition(this.left),
        right: this.normalizePosition(this.right),
        bottom: this.normalizePosition(this.bottom),
        top: this.normalizePosition(this.top),
        transform: `translate(${this.translateX}, ${this.translateY})`,
        zIndex: this.zIndex,
      };
    },
    overlayStyle() {
      return { background: this.maskBgColor };
    },
    overlayZIndex() {
      return Math.max(0, this.zIndex - 2);
    },
    showArrow() {
      return ['top', 'bottom', 'left', 'right'].includes(this.direction);
    },
    arrowStyle() {
      const base = {
        borderWidth: this.normalizeSize(this.borderWidth),
        left: this.normalizePosition(this.triangleLeft),
        right: this.normalizePosition(this.triangleRight),
        top: this.normalizePosition(this.triangleTop),
        bottom: this.normalizePosition(this.triangleBottom),
        zIndex: this.zIndex - 1,
      };
      const color = this.backgroundColor;
      switch (this.direction) {
        case 'bottom':
          return {
            ...base,
            borderColor: `${color} transparent transparent transparent`,
          };
        case 'left':
          return {
            ...base,
            borderColor: `transparent ${color} transparent transparent`,
          };
        case 'right':
          return {
            ...base,
            borderColor: `transparent transparent transparent ${color}`,
          };
        default:
          return {
            ...base,
            borderColor: `transparent transparent ${color} transparent`,
          };
      }
    },
  },
  methods: {
    handleClose() {
      if (!this.show) return;
      this.$emit('close');
    },
    normalizeSize(value) {
      if (value === undefined || value === null || value === '') return undefined;
      if (typeof value === 'number') return `${value}px`;
      const str = `${value}`.trim();
      if (!str) return undefined;
      if (str.endsWith('rpx')) {
        const numeric = Number.parseFloat(str.slice(0, -3));
        if (Number.isNaN(numeric)) return undefined;
        return `${numeric / 2}px`;
      }
      if (str.endsWith('px')) {
        return str;
      }
      const numeric = Number.parseFloat(str);
      return Number.isNaN(numeric) ? undefined : `${numeric}px`;
    },
    normalizePosition(value) {
      if (value === undefined || value === null || value === '' || value === 'auto') {
        return value === 'auto' ? 'auto' : undefined;
      }
      if (typeof value === 'number') return `${value}px`;
      const str = `${value}`.trim();
      if (!str) return undefined;
      if (str === 'auto') return 'auto';
      if (str.endsWith('%')) return str;
      return this.normalizeSize(str);
    },
  },
};
</script>

<style scoped>
.wf-popover {
  position: relative;
}

.wf-popover--flex-end {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.wf-popover__panel {
  transition: opacity 0.2s ease;
  opacity: 1;
  padding: 8px 0;
}

.wf-popover__panel--top,
.wf-popover__panel--bottom {
  display: inline-block;
}

.wf-popover__arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.wf-popover-fade-enter-active,
.wf-popover-fade-leave-active {
  transition: opacity 0.2s ease;
}

.wf-popover-fade-enter-from,
.wf-popover-fade-leave-to {
  opacity: 0;
}
</style>
