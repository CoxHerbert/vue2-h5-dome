<template>
  <div class="wl-wrapper">
    <!-- 组织选择（Vant Picker + Popup） -->
    <van-field
      class="organization"
      :model-value="orgLabel"
      label="组织"
      placeholder="请选组织"
      readonly
      clickable
      is-link
      :disabled="disabled"
      @click="openOrgPicker"
    />

    <van-popup v-model:show="showOrgPicker" position="bottom" round>
      <van-picker :columns="orgColumns" @confirm="onOrgConfirm" @cancel="showOrgPicker = false" />
    </van-popup>

    <!-- 物料输入展示（只读，点击打开弹窗） -->
    <van-field
      v-model="name"
      :label="label"
      :placeholder="placeholder || '物料选择'"
      readonly
      clickable
      is-link
      right-icon="search"
      :disabled="disabled"
      @click="handleSelect"
    />

    <!-- 物料选择弹窗（沿用你的 nf-wl-select） -->
    <nf-wl-select
      ref="materialSelect"
      :check-type="checkType"
      :default-checked="modelValue"
      :fuseorgid="fuseorgid"
      @on-confirm="handleSelectConfirm"
    />
  </div>
</template>

<script>
import { showToast } from 'vant';
import NfWlSelect from '../../nf-wl-select/index.vue';

export default {
  name: 'WlSelect',
  components: { NfWlSelect },
  props: {
    modelValue: [String, Number, Object],
    checkType: {
      // radio 单选 / checkbox 多选
      type: String,
      default: () => 'radio',
    },
    label: {
      type: String,
      default: () => '物料',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    placeholder: String,
    // 你原来有 userUrl，这里保留字段不破坏外部调用（本组件未用到）
    userUrl: {
      type: String,
      default: () => '/blade-system/search/user',
    },
    change: Function,
  },
  emits: ['update:modelValue'],

  data() {
    return {
      name: '',
      fuseorgid: '100006',
      ORG_LIST_CACHE: [],
      showOrgPicker: false,
    };
  },

  computed: {
    // Vant Picker columns
    orgColumns() {
      // 兼容 {label,value} 结构
      return (this.ORG_LIST_CACHE || []).map((x) => ({
        text: x.label,
        value: x.value,
      }));
    },
    orgLabel() {
      const hit = (this.ORG_LIST_CACHE || []).find((x) => x.value === this.fuseorgid);
      return hit?.label || '';
    },
  },

  watch: {
    modelValue: {
      handler(val) {
        if (val && typeof val === 'object') {
          this.name = val.fname || '';
        } else {
          this.name = '';
        }
      },
      immediate: true,
      deep: true,
    },
  },

  async mounted() {
    const res = await this.$http.request({
      url: '/blade-bip/org/select-data',
      method: 'post',
    });
    this.ORG_LIST_CACHE =
      res.data.map((item) => {
        return {
          id: item?.orgId,
          label: item?.orgName,
          value: item?.orgId,
        };
      }) || [];
  },

  methods: {
    openOrgPicker() {
      if (this.disabled) return;
      this.showOrgPicker = true;
    },
    onOrgConfirm({ selectedOptions }) {
      const pick = selectedOptions?.[0];
      this.fuseorgid = pick?.value || '';
      this.showOrgPicker = false;

      // 组织切换后，如果你希望清空已选物料（可按需开启）
      // this.name = '';
      // this.$emit('update:modelValue', null);
    },

    handleSelect() {
      if (this.readonly || this.disabled) return;

      if (!this.fuseorgid) {
        showToast('请先选择组织');
        return;
      }

      // 兼容：你的 nf-wl-select 可能是 visible / show / open()
      const comp = this.$refs.materialSelect;

      if (comp && typeof comp.open === 'function') {
        comp.open();
        return;
      }
      if (comp && 'show' in comp) {
        comp.show = true;
        return;
      }
      if (comp && 'visible' in comp) {
        comp.visible = true;
        return;
      }

      // 如果都不支持，给一个提示，方便你定位
      showToast('弹窗组件未暴露打开方法（open/show/visible）');
    },

    handleSelectConfirm(selectionList) {
      console.log('selectionList', selectionList[0]);
      const row = Array.isArray(selectionList) ? selectionList[0] : selectionList;

      this.name = row?.fname || '';
      console.log('this.name', this.name);
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
  padding: 12px;
}
.organization {
  margin-bottom: 10px;
}
</style>
