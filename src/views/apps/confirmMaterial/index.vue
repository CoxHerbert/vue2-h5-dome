<template>
  <div class="confirm-material">
    <dc-nav-bar ref="navRef" title="确认领料" fixed left-arrow @click-left="handleBack" />
    <div class="confirm-material__content">
      <van-tabs v-model:active="activeTab" :swipeable="false" shrink class="confirm-material__tabs">
        <van-tab v-for="tab in tabs" :key="tab.value" :name="tab.value" :title="tab.label" />
      </van-tabs>

      <SearchPanel v-if="activeTab === 'search'" @search="handleSearch" />
      <PendingList
        v-else-if="activeTab === 'pending'"
        :get-nav-el="getNavEl"
        @select="handleSelectOrder"
      />
      <ResultPanel v-else ref="resultRef" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import SearchPanel from './components/SearchPanel.vue';
import PendingList from './components/PendingList.vue';
import ResultPanel from './components/ResultPanel.vue';

const router = useRouter();
const navRef = ref(null);
const resultRef = ref(null);
const activeTab = ref('search');
const tabs = [
  { label: '查询条件', value: 'search' },
  { label: '待确认单据', value: 'pending' },
  { label: '结果提示', value: 'result' },
];

const getNavEl = () => navRef.value?.getNavEl?.();

function handleBack() {
  router.back();
}

function handleSearch(code) {
  if (!code) return;
  activeTab.value = 'result';
  resultRef.value?.fetchByCode(code);
}

function handleSelectOrder(order) {
  if (!order) return;
  activeTab.value = 'result';
  resultRef.value?.fetchByCode(order.outStockCode || order.code);
}
</script>

<style scoped>
.confirm-material {
  min-height: 100vh;
  background: #f7f8fa;
}

.confirm-material__content {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 96px);
  padding: 0 16px 16px;
  box-sizing: border-box;
}

.confirm-material__tabs {
  --van-tabs-line-height: 2px;
  margin: 12px 0;
  background: transparent;
}

:deep(.van-tab) {
  font-size: 14px;
}
</style>
