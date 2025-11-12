<template>
  <div class="wf-select">
    <u-input
      v-model="textLabel"
      type="text"
      :placeholder="getPlaceholder(column, column.type)"
      :disabled="disabled"
      readonly
      @click="onClick"
    />
    <u-select
      v-model="show"
      :list="dic"
      mode="single-column"
      :label-name="labelKey"
      :value-name="valueKey"
      :child-name="childrenKey"
      :title="column.label"
      @confirm="handleSubmit"
    ></u-select>
  </div>
</template>

<script>
import Props from '../../mixins/props.js';

export default {
  name: 'wf-select',
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
      if (this.disabled) return;
      this.show = true;
      this.handleClick();
    },
    handleSubmit(data) {
      const values = [];
      const labels = [];
      data.forEach((item) => {
        values.push(item.value);
        labels.push(item.label || '');
      });
      const valueText = values.join(',');
      const labelText = labels.join(',');
      this.text = valueText;
      this.textLabel = labelText;
      this.$emit('label-change', labelText);
    },
  },
};
</script>

<style lang="scss" scoped>
.wf-select {
  width: 100%;
}
</style>
