<template>
  <div class="wf-radio">
    <u-radio-group v-model="selected" :disabled="disabled" @change="onChange" @click="handleClick">
      <u-radio v-for="(item, index) in dic" :key="item[valueKey] ?? index" :name="item[valueKey]">
        {{ item[labelKey] }}
      </u-radio>
    </u-radio-group>
  </div>
</template>

<script>
import Props from '../../mixins/props.js';

export default {
  name: 'wf-radio',
  mixins: [Props],
  data() {
    return {
      selected: undefined,
    };
  },
  watch: {
    text: {
      handler(val) {
        this.selected = this.normalizeValue(val);
      },
      immediate: true,
    },
    dic: {
      handler() {
        this.selected = this.normalizeValue(this.text);
      },
      deep: true,
    },
  },
  methods: {
    normalizeValue(val) {
      if (this.validateNull(this.dic)) return val;
      const match = this.dic.find((item) => `${item[this.valueKey]}` === `${val}`);
      return match ? match[this.valueKey] : val;
    },
    onChange(val) {
      this.text = val;
    },
  },
};
</script>

<style lang="scss" scoped>
.wf-radio {
  width: 100%;
}
</style>
