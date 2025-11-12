<template>
  <van-form ref="formRef" v-bind="formProps">
    <slot />
  </van-form>
</template>

<script>
import { Form } from 'vant';

export default {
  name: 'u-form',
  components: { VanForm: Form },
  props: {
    model: {
      type: Object,
      default: () => ({}),
    },
    rules: {
      type: Object,
      default: () => ({}),
    },
    errorType: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['submit'],
  data() {
    return {
      innerRules: this.rules,
    };
  },
  computed: {
    formProps() {
      return {
        model: this.model,
        rules: this.innerRules,
      };
    },
  },
  watch: {
    rules: {
      handler(val) {
        this.innerRules = val || {};
      },
      deep: true,
    },
  },
  methods: {
    submit(event) {
      this.$emit('submit', event);
    },
    setRules(rules = {}) {
      this.innerRules = rules;
    },
    validate(callback) {
      const validator = this.$refs.formRef?.validate?.();
      if (typeof callback === 'function') {
        Promise.resolve(validator)
          .then(() => callback(true))
          .catch(() => callback(false));
      }
      return validator;
    },
    resetFields() {
      this.$refs.formRef?.resetValidation?.();
    },
  },
};
</script>
