<template>
  <van-avatar :size="size" :icon="icon" :src="src" :style="avatarStyle">
    <slot>
      <template v-if="!src && text">{{ text }}</template>
    </slot>
  </van-avatar>
</template>

<script>
import { Avatar } from 'vant';

export default {
  name: 'u-avatar',
  components: { VanAvatar: Avatar },
  props: {
    size: {
      type: [Number, String],
      default: 40,
    },
    icon: {
      type: String,
      default: '',
    },
    src: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    bgColor: {
      type: String,
      default: '#f2f3f5',
    },
    color: {
      type: String,
      default: '#323233',
    },
  },
  computed: {
    avatarStyle() {
      return {
        backgroundColor: this.bgColor,
        color: this.color,
      };
    },
  },
};
</script>
