<template>
  <div class="u-time-line">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'u-time-line',
};
</script>

<style scoped>
.u-time-line {
  position: relative;
  padding-left: 32rpx;
}
.u-time-line::before {
  content: '';
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  bottom: 12rpx;
  width: 2px;
  background-color: #ebedf0;
}
</style>
