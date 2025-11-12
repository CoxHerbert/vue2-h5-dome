<template>
  <div class="u-loadmore" @click="handleClick">
    <van-loading v-if="status === 'loading'" size="16px" />
    <span v-else>{{ statusText }}</span>
  </div>
</template>

<script>
import { Loading } from 'vant';

const STATUS_TEXT = {
  loadmore: '点击加载更多',
  loading: '加载中...',
  nomore: '没有更多了',
};

export default {
  name: 'u-loadmore',
  components: { VanLoading: Loading },
  props: {
    status: {
      type: String,
      default: 'loadmore',
    },
  },
  emits: ['loadmore'],
  computed: {
    statusText() {
      return STATUS_TEXT[this.status] || STATUS_TEXT.loadmore;
    },
  },
  methods: {
    handleClick() {
      if (this.status === 'loadmore') {
        this.$emit('loadmore');
      }
    },
  },
};
</script>

<style scoped>
.u-loadmore {
  text-align: center;
  padding: 12px 0;
  color: #969799;
  font-size: 14px;
}
</style>
