<template>
  <van-popup
    v-model:show="innerShow"
    :round="round"
    :position="position"
    :closeable="closeable"
    :safe-area-inset-bottom="safeAreaInsetBottom"
    :lock-scroll="lockScroll"
    :close-on-click-overlay="maskCloseAble"
    :style="popupStyle"
  >
    <slot />
  </van-popup>
</template>

<script setup>
import { computed, watch, ref } from 'vue';

defineOptions({
  name: 'u-popup',
});

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'center',
  },
  borderRadius: {
    type: [Number, String],
    default: 0,
  },
  maskCloseAble: {
    type: Boolean,
    default: true,
  },
  safeAreaInsetBottom: Boolean,
  height: {
    type: [Number, String],
    default: undefined,
  },
  closeable: Boolean,
  round: {
    type: [Boolean, Number, String],
    default: true,
  },
  lockScroll: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue', 'open', 'close']);

const innerShow = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    innerShow.value = val;
  },
);

watch(innerShow, (val) => {
  emit('update:modelValue', val);
  emit(val ? 'open' : 'close');
});

const position = computed(() => {
  switch (props.mode) {
    case 'bottom':
      return 'bottom';
    case 'left':
    case 'right':
    case 'top':
      return props.mode;
    default:
      return 'center';
  }
});

const popupStyle = computed(() => {
  const style = {};
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }
  if (props.borderRadius) {
    const radius = typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius;
    style.borderRadius = radius;
  }
  return style;
});
</script>
