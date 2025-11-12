<template>
  <van-tabs
    v-model:active="activeIndex"
    :background="bgColor"
    :color="activeColor"
    :title-inactive-color="inactiveColor"
    :swipe-threshold="swipeThreshold"
    :line-width="lineWidth"
    :line-height="lineHeight"
    @change="handleChange"
  >
    <van-tab v-for="(item, index) in list" :key="index" :name="index">
      <template #title>
        <span>{{ formatTitle(item) }}</span>
      </template>
      <slot :name="item.slot" :item="item" :index="index" />
    </van-tab>
  </van-tabs>
</template>

<script>
import { Tabs, Tab } from 'vant';

export default {
  name: 'u-tabs',
  components: { VanTabs: Tabs, VanTab: Tab },
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    current: {
      type: Number,
      default: 0,
    },
    bgColor: {
      type: String,
      default: '#ffffff',
    },
    activeColor: {
      type: String,
      default: '#1989fa',
    },
    inactiveColor: {
      type: String,
      default: '#646566',
    },
    lineWidth: {
      type: [Number, String],
      default: '30px',
    },
    lineHeight: {
      type: [Number, String],
      default: '3px',
    },
    isScroll: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['change', 'update:current'],
  data() {
    return {
      activeIndex: this.current,
    };
  },
  computed: {
    swipeThreshold() {
      return this.isScroll ? this.list.length : Math.max(this.list.length, 5);
    },
  },
  watch: {
    current(val) {
      this.activeIndex = val;
    },
  },
  methods: {
    formatTitle(item) {
      const name = item.name || '';
      if (item.count !== undefined && item.count !== '') {
        return `${name} (${item.count})`;
      }
      return name;
    },
    handleChange(index) {
      const value = Number(index);
      this.activeIndex = value;
      this.$emit('update:current', value);
      this.$emit('change', value);
    },
  },
};
</script>
