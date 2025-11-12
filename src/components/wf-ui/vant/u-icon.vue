<template>
  <van-icon :name="name" :color="color" :size="size" @click="onClick" />
</template>

<script>
import { Icon } from 'vant';

export default {
  name: 'u-icon',
  components: { VanIcon: Icon },
  props: {
    name: String,
    color: String,
    size: [Number, String],
  },
  emits: ['click'],
  methods: {
    onClick(event) {
      this.$emit('click', event);
    },
  },
};
</script>
