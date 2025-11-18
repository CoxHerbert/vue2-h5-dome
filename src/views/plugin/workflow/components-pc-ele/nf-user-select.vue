<template>
  <WfUserSelect v-bind="passthrough" />
</template>

<script setup>
import { computed, useAttrs } from 'vue';
import WfUserSelect from '../components/wf-user-select/index.vue';

defineOptions({ name: 'NfUserSelect', inheritAttrs: false });

const props = defineProps({
  defaultChecked: { type: String, default: '' },
  userUrl: { type: String, default: '/blade-system/search/user' },
  checkType: { type: String, default: 'radio' },
});

const attrs = useAttrs();
const passthrough = computed(() => ({
  ...props,
  ...attrs,
}));
</script>
