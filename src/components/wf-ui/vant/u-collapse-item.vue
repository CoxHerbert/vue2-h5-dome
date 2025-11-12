<template>
  <van-collapse-item :name="name" :disabled="disabled" :title="title">
    <slot />
    <template v-for="(_, slotName) in $slots" v-if="slotName === 'title'">
      <template #title>
        <slot name="title" />
      </template>
    </template>
  </van-collapse-item>
</template>

<script>
import { CollapseItem } from 'vant';

export default {
  name: 'u-collapse-item',
  components: { VanCollapseItem: CollapseItem },
  props: {
    name: [String, Number],
    disabled: Boolean,
    title: String,
  },
};
</script>
