<template>
  <UPopup v-model="visible" position="bottom" :style="{ borderRadius: '12px 12px 0 0' }">
    <van-picker
      :title="title"
      :columns="columns"
      :columns-field-names="fieldNames"
      :loading="loading"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </UPopup>
</template>

<script setup>
import { computed } from 'vue';
import UPopup from './UPopup.vue';

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
  loading: Boolean,
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const fieldNames = computed(() => ({
  text: props.labelName,
  value: props.valueName,
  children: props.childName,
}));

const columns = computed(() => {
  if (props.mode === 'single-column') {
    return props.list;
  }
  return [{ values: props.list }];
});

function normalizeOption(option) {
  const label = option?.[props.labelName] ?? '';
  const value = option?.[props.valueName];
  return { label, value };
}

function handleConfirm(values) {
  const selected = Array.isArray(values)
    ? values
    : values?.selectedOptions || values?.selectedValues || [];
  const options = Array.isArray(selected)
    ? selected.map((item) => normalizeOption(item))
    : [normalizeOption(values)];
  emit('confirm', options);
  emit('update:modelValue', false);
}

function handleCancel() {
  emit('cancel');
  emit('update:modelValue', false);
}
</script>
