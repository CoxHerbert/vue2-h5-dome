<template>
  <WfFlow v-bind="passthrough" />
</template>

<script setup>
import { computed, useAttrs } from 'vue';
import WfFlow from '../components/wf-flow/index.vue';

defineOptions({ name: 'NfFlow', inheritAttrs: false });

const props = defineProps({
  flow: { type: Array, default: () => [] },
});

const attrs = useAttrs();
const passthrough = computed(() => ({
  ...props,
  ...attrs,
}));
</script>
