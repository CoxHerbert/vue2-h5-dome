<template>
  <div>
    <van-cell-group :inset="inset" :class="cellGroupClass">
      <van-cell
        :title="titleText"
        :value="currentLabel"
        is-link
        @click="openSheet"
      />
    </van-cell-group>

    <van-action-sheet
      v-model:show="showSheet"
      :title="titleText"
      :actions="actions"
      :cancel-text="cancelButtonText"
      close-on-click-action
      @cancel="closeSheet"
      @select="onSelect"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { changeLocale } from '@/locales';

const LANGUAGE_OPTIONS = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' },
];

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  inset: {
    type: Boolean,
    default: true,
  },
  cellGroupClass: {
    type: [String, Array, Object],
    default: () => 'mt12',
  },
  title: {
    type: String,
    default: '',
  },
  cancelText: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

const { t, locale } = useI18n();

const showSheet = ref(false);

const selectedLocale = ref(props.modelValue || locale.value);

const titleText = computed(() => props.title || t('me.language.title'));
const cancelButtonText = computed(() => props.cancelText || t('me.form.cancel'));

const optionMap = computed(() =>
  LANGUAGE_OPTIONS.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {})
);

const currentLabel = computed(() => optionMap.value[selectedLocale.value] || '-');

const actions = computed(() =>
  LANGUAGE_OPTIONS.map((option) => ({
    name: option.label,
    value: option.value,
    color: selectedLocale.value === option.value ? '#3060ed' : undefined,
  }))
);

watch(
  () => props.modelValue,
  (val) => {
    if (val && val !== selectedLocale.value) {
      selectedLocale.value = val;
    }
  }
);

watch(locale, (val) => {
  if (val && val !== selectedLocale.value) {
    selectedLocale.value = val;
  }
});

watch(
  selectedLocale,
  (val, oldVal) => {
    if (!val || val === oldVal) return;
    emit('update:modelValue', val);
    emit('change', val);
    if (val !== locale.value) {
      changeLocale(val);
    }
  },
  { flush: 'sync' }
);

function openSheet() {
  showSheet.value = true;
}

function closeSheet() {
  showSheet.value = false;
}

function onSelect(action) {
  if (action?.value) {
    selectedLocale.value = action.value;
  }
  closeSheet();
}
</script>
