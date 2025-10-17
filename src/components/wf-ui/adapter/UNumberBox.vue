<template>
  <van-stepper
    v-model="currentValue"
    :min="min"
    :max="max"
    :step="step"
    :integer="positiveInteger"
    :disabled="disabled"
    :show-plus="true"
    :show-minus="true"
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: 0,
  },
  min: {
    type: [Number, String],
    default: 0,
  },
  max: {
    type: [Number, String],
    default: Number.MAX_SAFE_INTEGER,
  },
  step: {
    type: [Number, String],
    default: 1,
  },
  positiveInteger: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const currentValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>
