<template>
  <van-button
    v-bind="{ ...$attrs, ...mappedProps }"
    :style="buttonStyle"
    @click="emit('click', $event)"
  >
    <slot></slot>
  </van-button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'default',
  },
  size: {
    type: String,
    default: 'normal',
  },
  plain: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  customStyle: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['click']);

const mappedProps = computed(() => ({
  type: props.type,
  size: props.size,
  plain: props.plain,
  loading: props.loading,
  disabled: props.disabled,
}));

const buttonStyle = computed(() => props.customStyle);
</script>
