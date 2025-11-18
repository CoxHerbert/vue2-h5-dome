<template>
  <SelectionField
    v-model="innerValue"
    object-name="workList"
    :placeholder="placeholder"
    :label="label"
    :check-type="checkType"
    :return-type="checkType === 'radio' ? 'single' : 'array'"
    @change="handleChange"
  />
</template>

<script setup>
import { ref, watch } from 'vue';
import SelectionField from './base/SelectionField.vue';

defineOptions({ name: 'NfPrdmoSelect' });

const props = defineProps({
  modelValue: { type: [String, Number, Array, Object], default: null },
  checkType: { type: String, default: 'radio' },
  placeholder: { type: String, default: '请选择生产订单' },
  label: { type: String, default: '生产订单' },
});

const emit = defineEmits(['update:modelValue', 'onConfirm']);
const innerValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    innerValue.value = val;
  },
  { deep: true }
);

watch(
  innerValue,
  (val) => emit('update:modelValue', val),
  { deep: true }
);

function handleChange(val) {
  emit('onConfirm', val);
}
</script>
