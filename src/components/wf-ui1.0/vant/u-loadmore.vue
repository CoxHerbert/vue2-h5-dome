<template>
  <div class="u-loadmore" :style="{ marginBottom: marginBottom + 'px' }">
    <van-loading v-if="status === 'loading'" size="20" vertical>{{ loadingText }}</van-loading>
    <template v-else-if="status === 'nomore'">
      <span class="u-loadmore__text">{{ nomoreText }}</span>
    </template>
    <template v-else>
      <van-button size="small" type="primary" plain @click="emit('loadmore')">{{ loadmoreText }}</van-button>
    </template>
  </div>
</template>

<script setup>
defineOptions({
  name: 'u-loadmore',
});

const props = defineProps({
  status: {
    type: String,
    default: 'more',
  },
  loadingText: {
    type: String,
    default: '加载中...',
  },
  nomoreText: {
    type: String,
    default: '没有更多了',
  },
  loadmoreText: {
    type: String,
    default: '加载更多',
  },
  marginBottom: {
    type: [Number, String],
    default: 0,
  },
});

const emit = defineEmits(['loadmore']);
</script>

<style scoped>
.u-loadmore {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.u-loadmore__text {
  color: #999;
  font-size: 12px;
}
</style>
