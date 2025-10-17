<template>
  <van-collapse-item :name="itemName" :disabled="disabled">
    <template #title>
      <div class="u-collapse-item__title" :style="headStyle">
        <slot name="title">{{ title }}</slot>
      </div>
    </template>
    <slot></slot>
  </van-collapse-item>
</template>

<script setup>
import { inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  open: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  headStyle: {
    type: Object,
    default: () => ({}),
  },
});

const collapse = inject('uCollapseContext');
const itemName = ref(props.name || `u-collapse-item-${Math.random().toString(36).slice(2, 8)}`);

onMounted(() => {
  collapse?.registerItem(itemName.value, props.open);
});

onBeforeUnmount(() => {
  collapse?.unregisterItem(itemName.value);
});

watch(
  () => props.open,
  (value) => {
    collapse?.toggleItem(itemName.value, value);
  }
);
</script>

<style scoped>
.u-collapse-item__title {
  display: flex;
  align-items: center;
}
</style>
