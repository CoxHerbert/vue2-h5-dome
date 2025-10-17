<template>
  <van-collapse v-model="activeNames" :accordion="accordion">
    <slot></slot>
  </van-collapse>
</template>

<script setup>
import { provide, reactive, ref, watch } from 'vue';

const props = defineProps({
  accordion: {
    type: Boolean,
    default: false,
  },
});

const activeNames = ref(props.accordion ? '' : []);
const items = reactive(new Map());

function syncActiveNames() {
  const opened = Array.from(items.entries())
    .filter(([, value]) => value.open)
    .map(([key]) => key);
  if (props.accordion) {
    activeNames.value = opened[0] ?? '';
  } else {
    activeNames.value = opened;
  }
}

function registerItem(name, open) {
  items.set(name, { open });
  syncActiveNames();
}

function unregisterItem(name) {
  if (items.has(name)) {
    items.delete(name);
    syncActiveNames();
  }
}

function toggleItem(name, value) {
  const item = items.get(name);
  if (!item) return;
  if (props.accordion && value) {
    items.forEach((entry, key) => {
      entry.open = key === name;
    });
  } else {
    item.open = value;
  }
  syncActiveNames();
}

provide('uCollapseContext', {
  registerItem,
  unregisterItem,
  toggleItem,
  isAccordion: props.accordion,
});

watch(
  () => props.accordion,
  () => {
    syncActiveNames();
  }
);
</script>
