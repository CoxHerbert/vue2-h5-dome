<template>
  <van-search
    v-model="innerValue"
    :placeholder="placeholder"
    :show-action="showAction"
    @update:model-value="onInput"
    @change="emitChange"
    @search="emitSearch"
  >
    <template #action>
      <slot name="action" />
    </template>
  </van-search>
</template>

<script>
import { Search } from 'vant';

export default {
  name: 'u-search',
  components: { VanSearch: Search },
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '请输入',
    },
    showAction: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue', 'change', 'search'],
  data() {
    return { innerValue: this.modelValue };
  },
  watch: {
    modelValue(val) {
      this.innerValue = val;
    },
    innerValue(val) {
      this.$emit('update:modelValue', val);
    },
  },
  methods: {
    onInput(val) {
      this.innerValue = val;
    },
    emitChange(val) {
      this.$emit('change', val);
    },
    emitSearch(val) {
      this.$emit('search', val);
    },
  },
};
</script>
