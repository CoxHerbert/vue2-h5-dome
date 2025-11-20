<template>
  <NfUserSelect v-bind="passthrough" check-type="radio" />
</template>

<script setup>
import { computed, useAttrs } from 'vue';
import NfUserSelect from './nf-user-select.vue';

defineOptions({ name: 'NfRadioSelect', inheritAttrs: false });

const props = defineProps({
  defaultChecked: { type: String, default: '' },
  userUrl: { type: String, default: '/blade-system/search/user' },
});

const attrs = useAttrs();
const passthrough = computed(() => ({
  ...props,
  ...attrs,
}));
</script>
