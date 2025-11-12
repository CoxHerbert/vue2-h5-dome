<template>
  <van-skeleton
    :loading="loading"
    :avatar="avatar"
    :title="title"
    :row="row"
    :animate="animation"
    :avatar-size="avatarSize"
    :avatar-shape="avatarShape"
  >
    <slot />
  </van-skeleton>
</template>

<script>
import { Skeleton } from 'vant';

export default {
  name: 'u-skeleton',
  components: { VanSkeleton: Skeleton },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: Boolean,
      default: false,
    },
    avatarShape: {
      type: String,
      default: 'round',
    },
    avatarSize: {
      type: [Number, String],
      default: 40,
    },
    title: {
      type: Boolean,
      default: true,
    },
    row: {
      type: Number,
      default: 3,
    },
    animation: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
