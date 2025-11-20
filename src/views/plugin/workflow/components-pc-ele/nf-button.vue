<template>
  <WfButton v-bind="passthrough" />
</template>

<script setup>
import { computed, useAttrs } from 'vue';
import WfButton from '../components/wf-button/index.vue';

defineOptions({ name: 'NfButton', inheritAttrs: false });

const props = defineProps({
  loading: { type: Boolean, default: false },
  buttonList: { type: Array, default: () => [] },
  process: { type: Object, default: () => ({}) },
  comment: { type: String, default: '' },
});

const attrs = useAttrs();
const passthrough = computed(() => ({
  ...props,
  ...attrs,
}));
</script>
