<template>
  <van-field
    v-bind="fieldProps"
    :model-value="modelValue"
    :label="label"
    :readonly="readonly"
    :placeholder="placeholder"
    :clearable="clearabled"
    :is-link="isLink"
    :right-icon="rightIcon"
    @update:model-value="updateValue"
    @click="(event) => $emit('click', event)"
    @clear="(event) => $emit('clear', event)"
  >
    <template v-if="$slots.icon" #left-icon>
      <slot name="icon" />
    </template>
    <template v-if="$slots.default" #input>
      <slot />
    </template>
  </van-field>
</template>

<script setup>
import { computed, useAttrs } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  readonly: {
    type: Boolean,
    default: true,
  },
  clearabled: {
    type: Boolean,
    default: false,
  },
  isLink: {
    type: Boolean,
    default: false,
  },
  rightIcon: {
    type: String,
    default: '',
  },
});

defineOptions({
  name: 'u-field',
  inheritAttrs: false,
});

const emit = defineEmits(['update:modelValue', 'click', 'clear']);

const updateValue = (value) => {
  emit('update:modelValue', value);
};

const attrs = useAttrs();

const fieldProps = computed(() => ({
  ...attrs,
  clearable: props.clearabled,
}));
</script>
