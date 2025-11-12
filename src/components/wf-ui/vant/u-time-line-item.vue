<template>
  <div class="u-time-line-item">
    <div class="u-dot"></div>
    <div class="u-time-axis-node">
      <div class="u-time-line-content">
        <slot name="content">
          <slot />
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'u-time-line-item',
};
</script>

<style scoped>
.u-time-line-item {
  position: relative;
  margin-bottom: 24rpx;
}
.u-dot {
  position: absolute;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #1989fa;
  left: -4rpx;
  top: 12rpx;
}
.u-time-axis-node {
  margin-left: 32rpx;
}
.u-time-line-content {
  padding-left: 8rpx;
}
</style>
