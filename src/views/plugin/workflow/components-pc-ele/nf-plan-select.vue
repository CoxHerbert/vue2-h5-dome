<template>
  <SelectionField
    v-model="innerValue"
    object-name="mmrPlanOrder"
    :placeholder="placeholder"
    :label="label"
    :check-type="checkType"
    :query="query"
    :return-type="checkType === 'radio' ? 'single' : 'array'"
    @change="handleChange"
  />
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import SelectionField from './base/SelectionField.vue';

defineOptions({ name: 'NfPlanSelect' });

const props = defineProps({
  modelValue: { type: [String, Number, Array, Object], default: null },
  checkType: { type: String, default: 'radio' },
  placeholder: { type: String, default: '请选择现场计划单' },
  label: { type: String, default: '现场计划' },
  defaultQuery: { type: Object, default: () => ({ planOrderStatus: 'DC_MMR_PLAN_ORDER_STATUS_IP' }) },
});

const emit = defineEmits(['update:modelValue', 'onConfirm']);
const innerValue = ref(props.modelValue);
const query = computed(() => ({ ...props.defaultQuery }));

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
