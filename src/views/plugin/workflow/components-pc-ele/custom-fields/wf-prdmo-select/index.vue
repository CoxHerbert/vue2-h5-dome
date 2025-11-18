<template>
  <div class="wl-wrapper">
    <van-field
      v-model="name"
      class="wl-field"
      readonly
      clickable
      is-link
      :size="size"
      :placeholder="placeholder || '专案物料查询'"
      :disabled="disabled"
      :right-icon="disabled || readonly ? '' : 'search'"
      @click="handleSelect"
    />
    <nf-prdmo-select
      ref="prdmoSelectRef"
      :check-type="checkType"
      :default-checked="modelValue"
      @onConfirm="handleSelectConfirm"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import NfPrdmoSelect from '../../nf-prdmo-select/index.vue';

defineOptions({ name: 'prdmo-select' });

const props = defineProps({
  modelValue: { type: [String, Number, Object], default: '' },
  checkType: {
    type: String,
    default: () => 'radio',
  },
  size: {
    type: String,
    default: () => 'default',
  },
  readonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  change: Function,
});

const emit = defineEmits(['update:modelValue']);
const name = ref('');
const prdmoSelectRef = ref();

watch(
  () => props.modelValue,
  (val) => {
    if (val && typeof val === 'object') {
      name.value = val.materialName || '';
    } else {
      name.value = '';
    }
  },
  { immediate: true, deep: true }
);

function handleSelect() {
  if (props.readonly || props.disabled) return;
  if (prdmoSelectRef.value?.open) {
    prdmoSelectRef.value.open();
  } else if (prdmoSelectRef.value) {
    prdmoSelectRef.value.visible = true;
  }
}

function handleSelectConfirm(list = []) {
  const first = list[0];
  if (!first) return;
  name.value = first.materialName || '';
  emit('update:modelValue', first);
  if (typeof props.change === 'function') {
    props.change({ value: first });
  }
}
</script>

<style scoped lang="scss">
.wl-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wl-field {
  --van-field-input-text-color: var(--van-text-color);
}
</style>
