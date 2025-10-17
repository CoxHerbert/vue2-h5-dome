<template>
  <van-popup
    v-model:show="show"
    v-bind="$attrs"
    @open="$emit('open')"
    @close="$emit('close')"
    @opened="$emit('opened')"
    @closed="$emit('closed')"
  >
    <slot></slot>
  </van-popup>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'open', 'close', 'opened', 'closed']);

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>
