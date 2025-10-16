<template>
  <van-nav-bar
    v-bind="attrs"
    :class="['scroll-aware-nav-bar', { 'scroll-aware-nav-bar--hidden': isHidden }]"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps"></slot>
    </template>
  </van-nav-bar>
</template>

<script setup>
import { useAttrs } from 'vue';
import { useScrollHide } from '@/composables/useScrollHide';

const props = defineProps({
  threshold: {
    type: Number,
    default: 8,
  },
  scrollTarget: {
    type: [Function, Object],
    default: undefined,
  },
});

const attrs = useAttrs();

const { isHidden } = useScrollHide({
  threshold: props.threshold,
  target: props.scrollTarget,
});
</script>

<style scoped>
.scroll-aware-nav-bar {
  transition: transform 0.3s ease;
  will-change: transform;
}

.scroll-aware-nav-bar--hidden {
  transform: translateY(-100%);
}
</style>
