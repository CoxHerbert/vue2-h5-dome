<template>
  <van-empty
    :image="resolvedImage"
    :description="text"
    :style="{ fontSize: fontSizeStyle, ...imageSizeStyle }"
  />
</template>

<script>
import { defineComponent } from 'vue';
import { Empty } from 'vant';

export default defineComponent({
  name: 'WfEmpty',
  components: {
    [Empty.name]: Empty,
  },
  props: {
    text: { type: String, default: '暂无数据' },
    mode: { type: String, default: 'list' },
    src: { type: String, default: '' },
    iiconSize: { type: [String, Number], default: 145 },
    fontSize: { type: [String, Number], default: 30 },
  },
  computed: {
    resolvedImage() {
      const base = this.src || `${this.wfImage || ''}/public/empty.png`;
      return base;
    },
    imageSizeStyle() {
      const size = typeof this.iconSize === 'number' ? `${this.iconSize}px` : this.iconSize;
      return { '--van-empty-image-size': size };
    },
    fontSizeStyle() {
      return typeof this.fontSize === 'number' ? `${this.fontSize}px` : this.fontSize;
    },
  },
});
</script>

<style scoped>
.van-empty {
  width: 100%;
}
</style>
