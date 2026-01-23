<template>
  <div class="wl-wrapper">
    <!-- Vant 输入展示（只读，点击打开弹窗） -->
    <van-field
      v-model="name"
      :label="label"
      :placeholder="placeholder || '专案物料查询'"
      readonly
      clickable
      :disabled="disabled"
      right-icon="search"
      @click="handleSelect"
    />

    <!-- 选择弹窗（你原来的 nf-prdmo-select 组件） -->
    <NfPrdmoSelect
      ref="prdmoSelectRef"
      :check-type="checkType"
      :default-checked="modelValue"
      check-type="radio"
      @on-confirm="handleSelectConfirm"
    />
  </div>
</template>

<script>
import { showToast } from 'vant';
import NfPrdmoSelect from '../../nf-prdmo-select/index.vue';

export default {
  name: 'PrdmoSelect',
  components: { NfPrdmoSelect },
  props: {
    modelValue: [String, Number, Object],
    checkType: {
      // radio单选 checkbox多选
      type: String,
      default: () => 'radio',
    },
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    placeholder: String,
    change: Function,

    // 可选：如果你想在 Vant Field 显示 label
    label: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      name: '',
    };
  },
  watch: {
    modelValue: {
      handler(val) {
        if (val && typeof val === 'object') {
          this.name = val.materialName || '';
        } else {
          this.name = '';
        }
      },
      immediate: true,
      deep: false,
    },
  },
  methods: {
    handleSelect() {
      if (this.readonly || this.disabled) return;

      const dlg = this.$refs.prdmoSelectRef;
      if (dlg) {
        // 兼容你原来写法：直接控制 visible
        dlg.visible = true;
      } else {
        showToast('选择组件未就绪');
      }
    },

    handleSelectConfirm(list) {
      const row = Array.isArray(list) ? list[0] : null;
      if (!row) return;

      this.name = row.materialName || '';
      this.$emit('update:modelValue', row);

      if (this.change && typeof this.change === 'function') {
        this.change({ value: row });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.wl-wrapper {
  display: flex;
  align-items: center;
}
:deep(.van-field__label) {
  display: none;
}
</style>
