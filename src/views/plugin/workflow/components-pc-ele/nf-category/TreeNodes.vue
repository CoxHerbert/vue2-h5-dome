<template>
  <div class="tree-nodes">
    <div v-for="node in nodes" :key="node.id" class="tree-node">
      <van-cell :title="node.name" is-link @click="emit('node-click', node)" />
      <div v-if="node.children && node.children.length" class="tree-node__children">
        <TreeNodes :nodes="node.children" @node-click="emit('node-click', $event)" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'TreeNodes' });

defineProps({
  nodes: { type: Array, default: () => [] },
});
const emit = defineEmits(['node-click']);
</script>

<style scoped>
.tree-node__children {
  padding-left: 12px;
}
</style>
