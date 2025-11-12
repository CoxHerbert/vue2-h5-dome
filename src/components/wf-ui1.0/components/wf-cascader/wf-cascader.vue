<template>
  <div class="wf-cascader">
    <u-input
      v-model="textLabel"
      type="select"
      :placeholder="getPlaceholder(column, column.type)"
      :disabled="disabled"
      @click="onClick"
    />
    <u-popup v-model="show" mode="bottom" closeable>
      <cascader
        :props="column.props || {}"
        :item-list="dic"
        :title="column.label"
        @complete="onConfirm"
      />
    </u-popup>
  </div>
</template>

<script>
import Props from '../../mixins/props.js';
import Cascader from './components/cascader.vue';

export default {
  name: 'wf-cascader',
  components: { Cascader },
  mixins: [Props],
  data() {
    return {
      show: false,
    };
  },
  watch: {
    dic: {
      handler(val) {
        if (!this.validateNull(val)) this.initTextLabel();
      },
      deep: true,
    },
  },
  methods: {
    onClick() {
      if (!this.disabled) this.show = true;
      this.handleClick();
    },
    onConfirm(val) {
      const { result = [] } = val || {};
      const value = val ? val[this.valueKey] : undefined;
      if (this.column.type === 'cascader') {
        this.text = result.map((r) => r[this.valueKey]);
      } else {
        this.text = value;
      }
      this.textLabel = val ? val[this.labelKey] || '' : '';
      this.show = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.wf-cascader {
  width: 100%;
}
</style>
