<template>
  <van-field
    :name="prop"
    :label="label"
    :rules="rules"
    :required="required"
    :label-width="labelWidth"
    :label-align="labelPosition"
    :disabled="disabled"
    class="u-form-item"
  >
    <template #input>
      <slot />
    </template>
  </van-field>
</template>

<script>
import { Field } from 'vant';

export default {
  name: 'u-form-item',
  components: { VanField: Field },
  props: {
    label: String,
    prop: String,
    rules: {
      type: Array,
      default: () => [],
    },
    required: Boolean,
    labelWidth: {
      type: [Number, String],
      default: '6em',
    },
    labelPosition: {
      type: String,
      default: 'left',
    },
    disabled: Boolean,
  },
};
</script>

<style scoped>
.u-form-item {
  width: 100%;
}
</style>
