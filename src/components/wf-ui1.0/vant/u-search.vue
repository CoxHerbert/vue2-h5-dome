<template>
  <van-search
    v-bind="attrs"
    v-model="keyword"
    :placeholder="placeholder"
    :shape="shape"
    :clearable="clearabled"
    :show-action="showAction"
    :background="bgColor"
    @search="onSearch"
    @clear="onClear"
  >
    <template v-if="$slots.action" #action>
      <slot name="action" />
    </template>
  </van-search>
</template>

<script setup>
import { ref, watch, useAttrs } from 'vue';

defineOptions({
  name: 'u-search',
  inheritAttrs: false,
});

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  shape: {
    type: String,
    default: 'square',
  },
  clearabled: {
    type: Boolean,
    default: true,
  },
  showAction: {
    type: Boolean,
    default: true,
  },
  bgColor: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'search', 'change', 'clear']);

const keyword = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    keyword.value = val;
  },
);

watch(keyword, (val) => {
  emit('update:modelValue', val);
  emit('change', val);
});

const attrs = useAttrs();

const onSearch = (val) => {
  emit('search', val);
};

const onClear = () => {
  keyword.value = '';
  emit('clear');
};
</script>
