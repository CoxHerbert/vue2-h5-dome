<template>
  <van-popup
    v-model:show="innerShow"
    position="bottom"
    :close-on-click-overlay="maskCloseAble"
  >
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
  name: 'u-picker',
});

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'selector',
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
  defaultTime: {
    type: String,
    default: '00:00:00',
  },
  params: {
    type: Object,
    default: () => ({ hour: true, minute: true, second: true }),
  },
  maskCloseAble: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

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

const range = (start, end) => Array.from({ length: end - start + 1 }, (_, idx) => String(start + idx).padStart(2, '0'));

const defaultTimeParts = computed(() => {
  const [h = '00', m = '00', s = '00'] = (props.defaultTime || '').split(':');
  return {
    hour: h.padStart(2, '0'),
    minute: m.padStart(2, '0'),
    second: s.padStart(2, '0'),
  };
});

const columns = computed(() => {
  if (props.mode === 'time') {
    const { hour = true, minute = true, second = true } = props.params || {};
    const list = [];
    if (hour) {
      const values = range(0, 23);
      list.push({ values, defaultIndex: values.indexOf(defaultTimeParts.value.hour) });
    }
    if (minute) {
      const values = range(0, 59);
      list.push({ values, defaultIndex: values.indexOf(defaultTimeParts.value.minute) });
    }
    if (second) {
      const values = range(0, 59);
      list.push({ values, defaultIndex: values.indexOf(defaultTimeParts.value.second) });
    }
    return list;
  }
  return [];
});

const handleConfirm = ({ selectedValues }) => {
  if (props.mode === 'time') {
    const [hour, minute, second] = selectedValues;
    emit('confirm', {
      hour: hour ?? defaultTimeParts.value.hour,
      minute: minute ?? defaultTimeParts.value.minute,
      second: second ?? defaultTimeParts.value.second,
    });
  } else {
    emit('confirm', selectedValues);
  }
  innerShow.value = false;
};

const handleCancel = () => {
  emit('cancel');
  innerShow.value = false;
};
</script>
