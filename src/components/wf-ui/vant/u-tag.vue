<template>
  <van-tag :type="type" :size="size" :color="color" :plain="plain" :text-color="textColor">
    <slot>{{ text }}</slot>
  </van-tag>
</template>

<script>
import { Tag } from 'vant';

export default {
  name: 'u-tag',
  components: { VanTag: Tag },
  props: {
    type: {
      type: String,
      default: 'primary',
    },
    size: {
      type: String,
      default: 'medium',
    },
    text: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '',
    },
    textColor: {
      type: String,
      default: '',
    },
    plain: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
