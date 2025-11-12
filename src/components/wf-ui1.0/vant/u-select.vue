<template>
  <van-popup v-model:show="innerShow" position="bottom" :close-on-click-overlay="maskCloseAble">
    <van-picker
      show-toolbar
      :title="title"
      :columns="columns"
      :cancel-button-text="cancelText"
      :confirm-button-text="confirmText"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </van-popup>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

defineOptions({
  name: 'u-select',
});

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  list: {
    type: Array,
    default: () => [],
  },
  mode: {
    type: String,
    default: 'single-column',
  },
  labelName: {
    type: String,
    default: 'label',
  },
  valueName: {
    type: String,
    default: 'value',
  },
  childName: {
    type: String,
    default: 'children',
  },
  title: {
    type: String,
    default: '',
  },
  cancelText: {
    type: String,
    default: '取消',
  },
  confirmText: {
    type: String,
    default: '确认',
  },
  maskCloseAble: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const innerShow = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    innerShow.value = val;
  },
);

watch(innerShow, (val) => {
  emit('update:modelValue', val);
});

const columns = computed(() => {
  if (props.mode === 'single-column') {
    return props.list.map((item) => item[props.labelName]);
  }
  return [];
});

const handleConfirm = ({ selectedOptions, selectedValues, selectedIndexes }) => {
  if (props.mode === 'single-column') {
    const index = selectedIndexes?.[0] ?? 0;
    const option = props.list[index];
    const result = option
      ? [
          {
            label: option[props.labelName],
            value: option[props.valueName],
            raw: option,
          },
        ]
      : [];
    emit('confirm', result);
  } else {
    emit('confirm', selectedOptions || selectedValues);
  }
  innerShow.value = false;
};

const handleCancel = () => {
  innerShow.value = false;
};
</script>
