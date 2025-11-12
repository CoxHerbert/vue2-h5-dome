<template>
  <van-popup v-model:show="visible" position="bottom" round :close-on-click-overlay="maskCloseAble" @close="emitClose">
    <van-datetime-picker
      v-if="mode === 'time'"
      v-model="timeValue"
      type="time"
      :title="title"
      :columns-type="columnsType"
      :confirm-button-text="confirmText"
      :cancel-button-text="cancelText"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </van-popup>
</template>

<script>
import { Popup, DatetimePicker } from 'vant';

export default {
  name: 'u-picker',
  components: {
    VanPopup: Popup,
    VanDatetimePicker: DatetimePicker,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: 'time',
    },
    title: String,
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
  },
  emits: ['update:modelValue', 'confirm', 'cancel'],
  data() {
    return {
      visible: this.modelValue,
      timeValue: this.defaultTime || '00:00:00',
    };
  },
  computed: {
    columnsType() {
      const { hour, minute, second } = this.params;
      const result = [];
      if (hour !== false) result.push('hour');
      if (minute !== false) result.push('minute');
      if (second !== false) result.push('second');
      return result.length ? result : ['hour', 'minute'];
    },
  },
  watch: {
    modelValue(val) {
      this.visible = val;
    },
    visible(val) {
      this.$emit('update:modelValue', val);
    },
    defaultTime(val) {
      this.timeValue = val || '00:00:00';
    },
  },
  methods: {
    emitClose() {
      this.$emit('cancel');
    },
    handleConfirm(value) {
      this.$emit('confirm', value);
      this.visible = false;
    },
    handleCancel() {
      this.visible = false;
      this.$emit('cancel');
    },
  },
};
</script>
