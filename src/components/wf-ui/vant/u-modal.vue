<template>
  <van-dialog
    v-model:show="show"
    :title="title"
    :message="content"
    :show-cancel-button="showCancelButton"
    :show-confirm-button="showConfirmButton"
    :confirm-button-text="confirmText"
    :cancel-button-text="cancelText"
    :confirm-button-color="confirmColor"
    :cancel-button-color="cancelColor"
    :close-on-click-overlay="closeOnClickOverlay"
    :before-close="handleBeforeClose"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="$emit('close')"
  >
    <slot />
  </van-dialog>
</template>

<script>
import { Dialog } from 'vant';

export default {
  name: 'u-modal',
  components: { VanDialog: Dialog.Component },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    showCancelButton: {
      type: Boolean,
      default: false,
    },
    showConfirmButton: {
      type: Boolean,
      default: true,
    },
    confirmText: {
      type: String,
      default: '确认',
    },
    cancelText: {
      type: String,
      default: '取消',
    },
    confirmColor: {
      type: String,
      default: '#1989fa',
    },
    cancelColor: {
      type: String,
      default: '#323233',
    },
    closeOnClickOverlay: {
      type: Boolean,
      default: false,
    },
    asyncClose: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'confirm', 'cancel', 'close'],
  computed: {
    show: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
  },
  methods: {
    handleBeforeClose(action) {
      if (!this.asyncClose) return true;
      if (action === 'confirm') {
        this.$emit('confirm');
      } else if (action === 'cancel') {
        this.$emit('cancel');
      }
      return false;
    },
    handleConfirm() {
      if (!this.asyncClose) {
        this.$emit('confirm');
      }
    },
    handleCancel() {
      if (!this.asyncClose) {
        this.$emit('cancel');
      }
    },
  },
};
</script>
