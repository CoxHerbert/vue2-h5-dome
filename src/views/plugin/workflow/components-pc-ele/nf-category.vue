<template>
  <div class="nf-category">
    <van-search v-model="filterText" placeholder="搜索分类" background="#f7f8fa" />
    <div class="nf-category__tree">
      <TreeNodes :nodes="filteredTree" @node-click="handleNodeClick" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { Toast } from 'vant';
import TreeNodes from './nf-category/TreeNodes.vue';
import { tree } from '../api/design/category.js';

defineOptions({ name: 'NfCategory' });

const emit = defineEmits(['node-click', 'list-change']);
const filterText = ref('');
const sourceTree = ref([]);

const filteredTree = computed(() => {
  const keyword = filterText.value.trim().toLowerCase();
  if (!keyword) return sourceTree.value;
  const filterNodes = (nodes) => {
    if (!Array.isArray(nodes)) return [];
    return nodes
      .map((node) => {
        const children = filterNodes(node.children || []);
        const hit = (node.name || '').toLowerCase().includes(keyword);
        if (hit || children.length) {
          return { ...node, children };
        }
        return null;
      })
      .filter(Boolean);
  };
  return filterNodes(sourceTree.value);
});

async function loadTree() {
  try {
    const res = await tree();
    const list = res?.data?.data || [];
    sourceTree.value = [{ id: '', name: '全部' }, ...list];
    emit('list-change', JSON.parse(JSON.stringify(list)));
  } catch (error) {
    Toast.fail('分类加载失败');
  }
}

function handleNodeClick(node) {
  emit('node-click', { id: node.id });
}

onMounted(loadTree);
</script>

<style scoped>
.nf-category {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nf-category__tree {
  max-height: 60vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 8px;
}
</style>
