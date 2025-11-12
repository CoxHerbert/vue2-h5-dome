<template>
  <van-radio :name="name" :label-disabled="labelDisabled">
    <slot />
  </van-radio>
</template>

<script>
import { Radio } from 'vant';

export default {
  name: 'u-radio',
  components: { VanRadio: Radio },
  props: {
    name: {
      type: [String, Number],
      required: true,
    },
    labelDisabled: Boolean,
  },
};
</script>
