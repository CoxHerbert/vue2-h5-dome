<template>
  <van-empty :description="description" :image="image" :image-size="imageSize">
    <template v-if="$slots.default">
      <slot />
    </template>
  </van-empty>
</template>

<script setup>
defineOptions({
  name: 'u-empty',
});

defineProps({
  description: {
    type: String,
    default: '暂无数据',
  },
  image: {
    type: String,
    default: 'default',
  },
  imageSize: {
    type: [Number, String],
    default: 120,
  },
});
</script>
