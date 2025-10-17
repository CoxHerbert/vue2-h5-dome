<template>
  <form class="u-form" @submit.prevent="handleSubmit">
    <slot></slot>
  </form>
</template>

<script setup>
import { reactive, watch } from 'vue';
import { deepClone } from '../util/index.js';

const props = defineProps({
  model: {
    type: Object,
    default: () => ({}),
  },
  errorType: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['submit']);

const rules = reactive({});
let initialModel = deepClone(props.model || {});

watch(
  () => props.model,
  (model) => {
    initialModel = deepClone(model || {});
  },
  { deep: true }
);

function setRules(newRules = {}) {
  Object.keys(rules).forEach((key) => {
    delete rules[key];
  });
  Object.assign(rules, newRules);
}

function isEmptyValue(value) {
  if (Array.isArray(value)) return value.length === 0;
  return value === undefined || value === null || value === '';
}

async function validateRule(rule, value) {
  if (rule.required && isEmptyValue(value)) {
    return { valid: false, message: rule.message || '必填项不能为空' };
  }
  if (rule.pattern && !isEmptyValue(value)) {
    const pattern = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern);
    if (!pattern.test(String(value))) {
      return { valid: false, message: rule.message || '格式不正确' };
    }
  }
  if (typeof rule.validator === 'function') {
    const result = rule.validator(value, rule);
    if (result && typeof result.then === 'function') {
      const resolved = await result;
      if (resolved === false) {
        return { valid: false, message: rule.message || '校验失败' };
      }
      if (typeof resolved === 'string') {
        return { valid: false, message: resolved };
      }
    } else if (result === false) {
      return { valid: false, message: rule.message || '校验失败' };
    } else if (typeof result === 'string') {
      return { valid: false, message: result };
    }
  }
  return { valid: true };
}

async function runValidation() {
  const errors = [];
  for (const [prop, propRules] of Object.entries(rules)) {
    if (!Array.isArray(propRules) || propRules.length === 0) continue;
    const value = props.model ? props.model[prop] : undefined;
    for (const rule of propRules) {
      const result = await validateRule(rule, value);
      if (!result.valid) {
        errors.push({ prop, message: result.message });
        break;
      }
    }
  }
  return errors;
}

async function validate(callback) {
  const errors = await runValidation();
  const valid = errors.length === 0;
  if (callback) {
    callback(valid, errors);
  }
  return valid;
}

function resetFields() {
  if (!props.model) return;
  Object.keys(initialModel).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(props.model, key)) {
      // eslint-disable-next-line vue/no-mutating-props
      props.model[key] = deepClone(initialModel[key]);
    }
  });
}

function handleSubmit() {
  emit('submit', props.model);
}

function submit() {
  handleSubmit();
}

defineExpose({ setRules, validate, resetFields, submit });
</script>

<style scoped>
.u-form {
  width: 100%;
}
</style>
