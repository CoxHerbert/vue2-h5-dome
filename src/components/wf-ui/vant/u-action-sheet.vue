<template>
  <van-action-sheet
    v-model:show="show"
    :actions="actions"
    :description="descriptionText"
    :cancel-text="cancelText"
    :close-on-click-action="closeOnClickAction"
    :safe-area-inset-bottom="safeAreaInsetBottom"
    @select="handleSelect"
    @cancel="handleCancel"
    @close="handleClose"
  />
</template>

<script>
import { ActionSheet } from 'vant';

export default {
  name: 'u-action-sheet',
  components: { VanActionSheet: ActionSheet },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    list: {
      type: Array,
      default: () => [],
    },
    tips: {
      type: Object,
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
    cancelText: {
      type: String,
      default: '',
    },
    closeOnClickAction: {
      type: Boolean,
      default: true,
    },
    safeAreaInsetBottom: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'click', 'cancel', 'close'],
  computed: {
    show: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
    actions() {
      return this.list.map((item, index) => ({
        ...item,
        name: item.name || item.text || '',
        index,
      }));
    },
    descriptionText() {
      return (this.tips && this.tips.text) || this.description;
    },
  },
  methods: {
    handleSelect(action) {
      this.$emit('click', action.index);
    },
    handleCancel() {
      this.$emit('cancel');
    },
    handleClose() {
      this.$emit('close');
    },
  },
};
</script>
