<template>
  <div class="wf-cascader">
    <van-field
      v-model="textLabel"
      readonly
      is-link
      clickable
      :disabled="disabled"
      :placeholder="getPlaceholder(column, column.type)"
      @click="onClick"
    />
    <van-popup v-model:show="show" position="bottom" round @close="onClose">
      <van-cascader
        v-model="cascaderValue"
        :title="column.label"
        :options="dic"
        :field-names="fieldNames"
        v-bind="cascaderProps"
        @finish="onFinish"
        @close="onClose"
      />
    </van-popup>
  </div>
</template>

<script>
import { Cascader, Field, Popup } from 'vant';
import Props from '../../mixins/props.js';

export default {
  name: 'wf-cascader',
  components: {
    VanCascader: Cascader,
    VanField: Field,
    VanPopup: Popup,
  },
  mixins: [Props],
  data() {
    return {
      show: false,
      cascaderValue: undefined,
    };
  },
  computed: {
    fieldNames() {
      return {
        text: this.labelKey,
        value: this.valueKey,
        children: this.childrenKey,
      };
    },
    cascaderProps() {
      const props = this.column?.props || {};
      const { fieldNames, options, title, ...rest } = props;
      return rest;
    },
  },
  watch: {
    dic: {
      handler(val) {
        if (!this.validateNull(val)) {
          this.initTextLabel();
          this.initValue();
        }
      },
      deep: true,
    },
  },
  methods: {
    onClick() {
      if (!this.disabled) {
        this.show = true;
      }
      this.handleClick();
    },
    onClose() {
      this.show = false;
    },
    onFinish({ value, selectedOptions }) {
      const values = selectedOptions.map((option) => option?.[this.valueKey]).filter((val) => !this.validateNull(val));
      if (this.column.type === 'cascader') {
        this.text = values;
      } else {
        this.text = value;
      }
      this.cascaderValue = value;
      this.initTextLabel();
      this.onClose();
    },
    initValue() {
      if (this.validateNull(this.text)) {
        this.cascaderValue = undefined;
        return;
      }
      if (Array.isArray(this.text)) {
        const last = this.text[this.text.length - 1];
        this.cascaderValue = last;
      } else if (typeof this.text === 'string') {
        const list = this.text.split(',').filter(Boolean);
        this.cascaderValue = list.length ? list[list.length - 1] : this.text;
      } else {
        this.cascaderValue = this.text;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.wf-cascader {
  width: 100%;
}
</style>
