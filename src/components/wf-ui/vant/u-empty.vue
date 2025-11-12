<template>
  <van-empty :description="text">
    <slot />
  </van-empty>
</template>

<script>
import { Empty } from 'vant';

export default {
  name: 'u-empty',
  components: { VanEmpty: Empty },
  props: {
    text: {
      type: String,
      default: '暂无数据',
    },
  },
};
</script>
