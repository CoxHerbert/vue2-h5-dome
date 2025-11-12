<template>
  <div class="wf-empty" :style="containerStyle">
    <u-empty :description="description" :image="resolvedImage" :image-size="resolvedImageSize">
      <slot />
    </u-empty>
  </div>
</template>

<script>
const MODE_IMAGE_MAP = {
  list: 'default',
  default: 'default',
  search: 'search',
  error: 'error',
  network: 'network',
};

export default {
  name: 'wf-empty',
  props: {
    text: { type: String },
    mode: {
      type: String,
      default: 'list',
    },
    src: { type: String },
    iconSize: {
      type: [String, Number],
      default: '263',
    },
    marginTop: { type: [String, Number] },
    fontSize: {
      type: [String, Number],
      default: '30',
    },
  },
  data() {
    return {
      imageUrl: `${this.wfImage}/public/empty.png`,
      marginTOP: 0,
    };
  },
  computed: {
    description() {
      return this.text || '暂无数据';
    },
    resolvedImage() {
      if (this.src) return this.src;
      const mode = MODE_IMAGE_MAP[this.mode] || 'default';
      if (['default', 'search', 'error', 'network'].includes(mode)) {
        return mode === 'default' ? this.imageUrl : mode;
      }
      return this.imageUrl;
    },
    resolvedImageSize() {
      return this.normalizeSize(this.iconSize, true) || 120;
    },
    containerStyle() {
      const style = {};
      const marginTop = this.marginTop
        ? this.normalizeSize(this.marginTop)
        : `${this.marginTOP}px`;
      if (marginTop) {
        style.marginTop = marginTop;
      }
      const fontSize = this.normalizeSize(this.fontSize);
      if (fontSize) {
        style.fontSize = fontSize;
      }
      return style;
    },
  },
  mounted() {
    this.setAutoMargin();
  },
  methods: {
    setAutoMargin() {
      if (this.marginTop) return;
      const height = typeof window !== 'undefined' ? window.innerHeight : 0;
      this.marginTOP = height ? Math.round(height / 2.5) : 0;
    },
    normalizeSize(value, returnNumber = false) {
      if (value === undefined || value === null || value === '') return '';
      if (typeof value === 'number') {
        return returnNumber ? value : `${value}px`;
      }
      const str = `${value}`.trim();
      if (!str) return '';
      if (str.endsWith('rpx')) {
        const numeric = Number.parseFloat(str.slice(0, -3));
        if (Number.isNaN(numeric)) return '';
        const px = numeric / 2;
        return returnNumber ? px : `${px}px`;
      }
      if (str.endsWith('px')) {
        const numeric = Number.parseFloat(str.slice(0, -2));
        if (Number.isNaN(numeric)) return '';
        return returnNumber ? numeric : `${numeric}px`;
      }
      const numeric = Number.parseFloat(str);
      if (Number.isNaN(numeric)) return '';
      return returnNumber ? numeric : `${numeric}px`;
    },
  },
};
</script>

<style lang="scss" scoped>
.wf-empty {
  display: flex;
  justify-content: center;
}
</style>
