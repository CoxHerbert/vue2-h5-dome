<template>
  <SelectDialog
    v-model="innerValue"
    :object-name="objectName"
    :placeholder="placeholder"
    :label="label"
    :disabled="disabled"
    :clearable="clearable"
    :multiple="isMultiple"
    :width="width"
    :query="query"
    :show-value="showValue"
    :return-type="computedReturnType"
    :master-key="masterKey"
    :show-key="showKey"
    :tag-color="tagColor"
    :tag-text-color="tagTextColor"
    :change="handleDialogChange"
    v-bind="restAttrs"
  />
</template>

<script setup>
import { computed, reactive, ref, useAttrs, watch } from 'vue';
import SelectDialog from '@/components/dc-ui/components/SelectDialog/index.vue';

defineOptions({ name: 'NfSelectionField', inheritAttrs: false });

const props = defineProps({
  modelValue: { type: [String, Number, Array, Object], default: null },
  objectName: { type: String, required: true },
  placeholder: { type: String, default: '' },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true },
  multiple: { type: Boolean, default: false },
  checkType: { type: String, default: 'radio' },
  width: { type: String, default: '100%' },
  query: { type: Object, default: () => ({}) },
  showValue: { type: Boolean, default: true },
  returnType: { type: String, default: '' },
  masterKey: { type: String, default: '' },
  showKey: { type: String, default: '' },
  tagColor: { type: String, default: '#ecf5ff' },
  tagTextColor: { type: String, default: '#1989fa' },
  change: { type: Function, default: null },
});

const emit = defineEmits(['update:modelValue', 'change']);
const attrs = useAttrs();

const innerValue = ref(props.modelValue);
const restAttrs = reactive({});

const isMultiple = computed(() => props.multiple || props.checkType === 'checkbox');
const computedReturnType = computed(() => {
  if (props.returnType) return props.returnType;
  return isMultiple.value ? 'array' : 'single';
});

watch(
  () => props.modelValue,
  (val) => {
    innerValue.value = val;
  },
  { deep: true }
);

watch(
  innerValue,
  (val) => {
    emit('update:modelValue', val);
  },
  { deep: true }
);

function handleDialogChange(payload) {
  const value = payload?.value ?? payload;
  emit('change', value);
  props.change?.(payload);
}

watch(
  () => ({ ...attrs }),
  (val) => {
    Object.keys(restAttrs).forEach((key) => delete restAttrs[key]);
    Object.assign(restAttrs, val);
  },
  { immediate: true }
);
</script>
