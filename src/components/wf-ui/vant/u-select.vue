<template>
  <van-popup v-model:show="visible" position="bottom" round @close="close">
    <van-picker
      show-toolbar
      :title="title"
      :columns="columns"
      @cancel="close"
      @confirm="handleConfirm"
    />
  </van-popup>
</template>

<script>
import { Popup, Picker } from 'vant';

export default {
  name: 'u-select',
  components: {
    VanPopup: Popup,
    VanPicker: Picker,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    list: {
      type: Array,
      default: () => [],
    },
    mode: {
      type: String,
      default: 'single-column',
    },
    labelName: {
      type: String,
      default: 'label',
    },
    valueName: {
      type: String,
      default: 'value',
    },
    childName: {
      type: String,
      default: 'children',
    },
    title: String,
  },
  emits: ['update:modelValue', 'confirm', 'cancel'],
  data() {
    return {
      visible: this.modelValue,
    };
  },
  computed: {
    columns() {
      if (this.mode === 'single-column') {
        return this.list.map((item) => ({
          text: item[this.labelName],
          value: item[this.valueName],
          raw: item,
        }));
      }
      return this.list;
    },
  },
  watch: {
    modelValue(val) {
      this.visible = val;
    },
    visible(val) {
      this.$emit('update:modelValue', val);
    },
  },
  methods: {
    close() {
      this.visible = false;
      this.$emit('cancel');
    },
    handleConfirm(value, index) {
      let selectedOptions = [];
      if (Array.isArray(value)) {
        selectedOptions = value.map((item, idx) => {
          if (typeof item === 'object') {
            return item;
          }
          const option = this.columns[idx];
          if (Array.isArray(option?.values)) {
            return option.values[item] || {};
          }
          return option || {};
        });
      } else if (Array.isArray(value?.selectedOptions)) {
        selectedOptions = value.selectedOptions;
      }
      const result = selectedOptions.map((item) => ({
        label: item?.[this.labelName] ?? item?.text,
        value: item?.[this.valueName] ?? item?.value,
      }));
      this.$emit('confirm', result);
      this.visible = false;
    },
  },
};
</script>
