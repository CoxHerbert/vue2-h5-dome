<!-- WithdrawnSelectFieldVant.vue (Options API) -->
<template>
  <div class="wl-wrapper">
    <van-field
      v-model="name"
      :label="label"
      :placeholder="placeholder || '离职人员查询'"
      readonly
      clickable
      :disabled="disabled"
      :input-align="inputAlign"
      right-icon="search"
      @click="handleSelect"
    />

    <WithdrawnSelectVant
      ref="dlgRef"
      title="离职人员查询"
      :check-type="checkType"
      :default-checked="modelValue"
      @on-confirm="handleSelectConfirm"
    />
  </div>
</template>

<script>
import { showToast } from 'vant';
import WithdrawnSelectVant from '../../nf-withdrawn-select/index.vue';

export default {
  name: 'WithdrawnSelect',
  components: { WithdrawnSelectVant },
  props: {
    modelValue: [String, Number, Object],
    checkType: {
      type: String,
      default: 'radio',
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: String,
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    change: Function,
    inputAlign: {
      type: String,
      default: 'right', // left/center/right
    },
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
          this.name = val.name ?? val.realName ?? '';
        } else {
          this.name = '';
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    handleSelect() {
      if (this.readonly || this.disabled) return;

      // 优先用弹窗组件暴露的 open()
      const dlg = this.$refs.dlgRef;
      if (dlg?.open) {
        dlg.open();
        return;
      }

      // 兜底：如果弹窗组件仍保留 visible
      if (dlg) dlg.visible = true;
    },

    handleSelectConfirm(list) {
      if (!Array.isArray(list) || list.length === 0) {
        showToast('请选择至少一条数据');
        return;
      }
      const picked = list[0];
      this.name = picked?.name ?? picked?.realName ?? '';
      this.$emit('update:modelValue', picked);
      if (this.change && typeof this.change === 'function') {
        this.change({ value: picked });
      }
    },
  },
};
</script>

<style scoped lang="scss">
.wl-wrapper {
  display: flex;
  align-items: center;
}
:deep(.van-field__label) {
  display: none;
}
</style>
