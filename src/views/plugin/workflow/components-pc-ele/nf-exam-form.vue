<template>
  <WfExamForm v-bind="passthrough" />
</template>

<script setup>
import { computed, useAttrs } from 'vue';
import WfExamForm from '../components/wf-exam-form/index.vue';

defineOptions({ name: 'NfExamForm', inheritAttrs: false });

const props = defineProps({
  process: { type: Object, default: () => ({}) },
  comment: { type: String, default: '' },
});

const attrs = useAttrs();
const passthrough = computed(() => ({
  ...props,
  ...attrs,
}));
</script>
