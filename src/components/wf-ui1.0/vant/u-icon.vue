<template>
  <van-icon :name="resolvedName" :color="color" :size="iconSize" v-bind="$attrs" />
</template>

<script setup>
import { computed } from 'vue';

defineOptions({
  name: 'u-icon',
});

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '',
  },
  size: {
    type: [Number, String],
    default: 16,
  },
});

const nameMap = {
  'arrow-downward': 'arrow-down',
  'arrow-upward': 'arrow-up',
  calendar: 'calendar-o',
  clock: 'clock-o',
  plus: 'plus',
  close: 'cross',
};

const resolvedName = computed(() => nameMap[props.name] || props.name);

const iconSize = computed(() => {
  if (typeof props.size === 'number') return `${props.size}px`;
  if (typeof props.size === 'string' && props.size.endsWith('rpx')) {
    const value = Number(props.size.replace('rpx', ''));
    if (!Number.isNaN(value) && typeof window !== 'undefined') {
      return `${(value / 750) * window.innerWidth}px`;
    }
  }
  return props.size || 16;
});
</script>
