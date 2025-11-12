<template>
  <div class="wf-input">
    <u-input
      v-model="text"
      :type="inputType"
      :maxlength="column.maxlength || 350"
      :placeholder="getPlaceholder(column, column.type)"
      :disabled="disabled"
      :readonly="column.readonly"
      :height="inputHeight"
      :border="column.border || false"
      :autosize="column.autosize"
      @click="handleClick"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </div>
</template>

<script>
import Props from '../../mixins/props.js';

export default {
  name: 'wf-input',
  mixins: [Props],
  data() {
    return {
      typeDic: {
        input: 'text',
        number: 'digit',
        textarea: 'textarea',
        password: 'password',
      },
    };
  },
  computed: {
    inputType() {
      return this.typeDic[this.column.type] || 'text';
    },
    inputHeight() {
      return this.normalizeSize(this.column.height || '70rpx');
    },
  },
  methods: {
    normalizeSize(value) {
      if (value === undefined || value === null || value === '') return undefined;
      if (typeof value === 'number') return value;
      const str = `${value}`.trim();
      if (!str) return undefined;
      if (str.endsWith('rpx')) {
        const numeric = Number.parseFloat(str.slice(0, -3));
        if (Number.isNaN(numeric)) return undefined;
        return numeric / 2;
      }
      if (str.endsWith('px')) {
        const numeric = Number.parseFloat(str.slice(0, -2));
        return Number.isNaN(numeric) ? undefined : numeric;
      }
      const numeric = Number.parseFloat(str);
      return Number.isNaN(numeric) ? undefined : numeric;
    },
  },
};
</script>

<style lang="scss" scoped>
.wf-input {
  width: 100%;
}
</style>
