<template>
  <van-field
    v-bind="fieldProps"
    :model-value="modelValue"
    :type="mappedType"
    :maxlength="maxlength"
    :disabled="disabled"
    :readonly="readonly"
    :placeholder="placeholder"
    :show-word-limit="showWordLimit"
    :border="border"
    :rows="rows"
    @update:model-value="updateValue"
    @focus="(event) => $emit('focus', event)"
    @blur="(event) => $emit('blur', event)"
    @click="(event) => $emit('click', event)"
  >
    <template v-if="$slots.icon" #left-icon>
      <slot name="icon" />
    </template>
    <template v-if="$slots['right-icon']" #right-icon>
      <slot name="right-icon" />
    </template>
    <template v-if="$slots.default" #input>
      <slot />
    </template>
  </van-field>
</template>

<script setup>
import { computed, useAttrs } from 'vue';

defineOptions({
  name: 'u-input',
  inheritAttrs: false,
});

const props = defineProps({
  modelValue: [String, Number, Array],
  type: {
    type: String,
    default: 'text',
  },
  maxlength: {
    type: [Number, String],
    default: null,
  },
  disabled: Boolean,
  readonly: Boolean,
  placeholder: {
    type: String,
    default: '',
  },
  border: {
    type: Boolean,
    default: true,
  },
  height: {
    type: [String, Number],
    default: undefined,
  },
  showWordLimit: Boolean,
  autosize: {
    type: [Boolean, Object],
    default: undefined,
  },
});

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'click']);

const updateValue = (value) => {
  emit('update:modelValue', value);
};

const typeMap = {
  input: 'text',
  number: 'digit',
  textarea: 'textarea',
  password: 'password',
  digit: 'digit',
};

const mappedType = computed(() => typeMap[props.type] || props.type || 'text');

const rows = computed(() => {
  if (props.autosize) return undefined;
  if (mappedType.value === 'textarea' && props.height) {
    if (typeof props.height === 'number') {
      return Math.max(Math.round(props.height / 24), 2);
    }
  }
  return undefined;
});

const attrs = useAttrs();

const fieldProps = computed(() => ({
  ...attrs,
  autosize: props.autosize ?? (mappedType.value === 'textarea' ? true : undefined),
  style: props.height
    ? {
        minHeight: typeof props.height === 'number' ? `${props.height}px` : props.height,
      }
    : attrs.style,
}));
</script>
