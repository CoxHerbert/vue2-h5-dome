<template>
  <UPopup v-model="visible" position="bottom" :style="{ borderRadius: '12px 12px 0 0' }">
    <van-time-picker
      v-model="timeValues"
      :columns-type="columnsType"
      :title="title"
      :cancel-button-text="cancelText"
      @confirm="onConfirm"
      @cancel="onCancel"
    />
  </UPopup>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import UPopup from './UPopup.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'time',
  },
  title: {
    type: String,
    default: '',
  },
  cancelText: {
    type: String,
    default: '取消',
  },
  defaultTime: {
    type: String,
    default: '00:00:00',
  },
  params: {
    type: Object,
    default: () => ({ hour: true, minute: true, second: true }),
  },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const columnsType = computed(() => {
  if (props.mode !== 'time') return ['hour', 'minute', 'second'];
  const result = [];
  if (props.params?.hour !== false) result.push('hour');
  if (props.params?.minute !== false) result.push('minute');
  if (props.params?.second !== false) result.push('second');
  return result.length ? result : ['hour', 'minute', 'second'];
});

const timeValues = ref(['00', '00', '00']);

function parseTime(time) {
  if (!time) return ['00', '00', '00'];
  const [hour = '00', minute = '00', second = '00'] = time.split(':');
  return [hour, minute, second];
}

watch(
  () => props.defaultTime,
  (value) => {
    timeValues.value = parseTime(value);
  },
  { immediate: true }
);

function onConfirm(payload) {
  const values = Array.isArray(payload)
    ? payload
    : payload?.selectedValues || payload?.values || timeValues.value;
  const [hour = '00', minute = '00', second = '00'] = values;
  emit('confirm', { hour, minute, second });
  emit('update:modelValue', false);
}

function onCancel() {
  emit('cancel');
  emit('update:modelValue', false);
}
</script>
