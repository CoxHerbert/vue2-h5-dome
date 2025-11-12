<template>
  <div class="wf-switch">
    <u-switch
      v-model="switchValue"
      :active-value="activeValue"
      :inactive-value="inactiveValue"
      :active-color="column.activeColor"
      :inactive-color="column.inactiveColor"
      :disabled="disabled"
      @change="onChange"
    ></u-switch>
  </div>
</template>

<script>
import Props from '../../mixins/props.js';

export default {
  name: 'wf-switch',
  mixins: [Props],
  data() {
    return {
      switchValue: undefined,
      activeValue: '1',
      inactiveValue: '0',
    };
  },
  watch: {
    text: {
      handler(val) {
        this.switchValue = this.normalizeValue(val);
      },
      immediate: true,
    },
    'column.dicData': {
      handler() {
        this.initOptions();
        this.switchValue = this.normalizeValue(this.text);
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    initOptions() {
      const { dicData } = this.column || {};
      if (Array.isArray(dicData) && dicData.length >= 2) {
        this.inactiveValue = dicData[0].value;
        this.activeValue = dicData[1].value;
        return;
      }
      if (this.column.activeValue !== undefined) {
        this.activeValue = this.column.activeValue;
      }
      if (this.column.inactiveValue !== undefined) {
        this.inactiveValue = this.column.inactiveValue;
      }
    },
    normalizeValue(val) {
      const candidate = val !== undefined ? val : this.inactiveValue;
      if (`${candidate}` === `${this.activeValue}`) {
        return this.activeValue;
      }
      if (`${candidate}` === `${this.inactiveValue}`) {
        return this.inactiveValue;
      }
      return this.inactiveValue;
    },
    onChange(val) {
      this.text = val;
    },
  },
};
</script>

<style lang="scss" scoped>
.wf-switch {
  display: flex;
  align-items: center;
}
</style>
