<template>
  <div class="wf-checkbox">
    <u-checkbox-group
      v-model="selectedValues"
      :disabled="disabled"
      :direction="column.direction || 'vertical'"
      @change="onChange"
      @click="handleClick"
    >
      <u-checkbox
        v-for="(item, index) in dic"
        :key="item[valueKey] ?? index"
        :name="item[valueKey]"
      >
        {{ item[labelKey] }}
      </u-checkbox>
    </u-checkbox-group>
  </div>
</template>

<script>
import Props from '../../mixins/props.js';

export default {
  name: 'wf-checkbox',
  mixins: [Props],
  data() {
    return {
      selectedValues: [],
    };
  },
  watch: {
    dic: {
      handler(val) {
        if (!this.validateNull(val)) {
          this.syncFromText(this.text);
        } else {
          this.selectedValues = [];
        }
      },
      deep: true,
    },
    text: {
      handler(val) {
        this.syncFromText(val);
      },
      immediate: true,
    },
  },
  methods: {
    syncFromText(val) {
      if (this.validateNull(this.dic)) {
        this.selectedValues = [];
        return;
      }
      const normalized = [];
      const rawValues = Array.isArray(val)
        ? val
        : this.validateNull(val)
        ? []
        : (val + '').split(',').filter(Boolean);
      rawValues.forEach((candidate) => {
        const match = this.dic.find(
          (item) => `${item[this.valueKey]}` === `${candidate}`,
        );
        if (match) {
          normalized.push(match[this.valueKey]);
        }
      });
      this.selectedValues = normalized;
    },
    onChange(val) {
      this.text = Array.isArray(val) ? val : [];
    },
  },
};
</script>

<style lang="scss" scoped>
.wf-checkbox {
  width: 100%;
}
</style>
