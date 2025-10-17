<template>
  <div class="u-loadmore" :style="{ marginBottom }">
    <template v-if="status === 'loading'">
      <van-loading size="24px">加载中...</van-loading>
    </template>
    <template v-else-if="status === 'nomore'">
      <span class="u-loadmore__text">没有更多了</span>
    </template>
    <template v-else>
      <van-button type="primary" size="small" @click="emit('loadmore')">加载更多</van-button>
    </template>
  </div>
</template>

<script setup>
const { status, marginBottom } = defineProps({
  status: {
    type: String,
    default: 'loadmore',
  },
  marginBottom: {
    type: [Number, String],
    default: '0',
  },
});

const emit = defineEmits(['loadmore']);
</script>

<style scoped>
.u-loadmore {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 12px 0;
  color: #969799;
  font-size: 14px;
}

.u-loadmore__text {
  color: #969799;
}
</style>
