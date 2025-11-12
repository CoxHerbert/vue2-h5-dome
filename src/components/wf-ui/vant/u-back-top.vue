<template>
  <van-back-top v-if="visible" :bottom="bottom" :right="right" @click="handleClick">
    <slot>
      <van-icon name="arrow-up" />
    </slot>
  </van-back-top>
</template>

<script>
import { BackTop, Icon } from 'vant';

export default {
  name: 'u-back-top',
  components: { VanBackTop: BackTop, VanIcon: Icon },
  props: {
    scrollTop: {
      type: Number,
      default: 0,
    },
    threshold: {
      type: Number,
      default: 200,
    },
    bottom: {
      type: [Number, String],
      default: 80,
    },
    right: {
      type: [Number, String],
      default: 24,
    },
  },
  emits: ['click'],
  computed: {
    visible() {
      return this.scrollTop > this.threshold;
    },
  },
  methods: {
    handleClick(event) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.$emit('click', event);
    },
  },
};
</script>
