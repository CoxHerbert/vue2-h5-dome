<template>
  <div class="confirm-material">
    <dc-nav-bar ref="navRef" title="确认领料" fixed left-arrow @click-left="handleBack" />
    <div class="confirm-material__content">
      <van-sticky ref="stickyRef" :offset-top="tabsOffsetTop" class="confirm-material__sticky">
        <div ref="stickyInnerRef">
          <van-tabs
            ref="tabsRef"
            v-model:active="activeTab"
            :swipeable="false"
            shrink
            class="confirm-material__tabs"
          >
            <van-tab v-for="tab in tabs" :key="tab.value" :name="tab.value" :title="tab.label" />
          </van-tabs>
        </div>
      </van-sticky>

      <SearchPanel v-if="activeTab === 'search'" @search="handleSearch" />
      <PendingList
        v-else-if="activeTab === 'pending'"
        :get-nav-el="getNavEl"
        :sticky-top="paginationStickyTop"
        @select="handleSelectOrder"
      />
      <ResultPanel v-else ref="resultRef" />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import SearchPanel from './components/SearchPanel.vue';
import PendingList from './components/PendingList.vue';
import ResultPanel from './components/ResultPanel.vue';

const router = useRouter();
const navRef = ref(null);
const resultRef = ref(null);
const activeTab = ref('search');
const tabsOffsetTop = ref(46);
const tabsRef = ref(null);
const stickyRef = ref(null);
const stickyInnerRef = ref(null);
const navHeight = ref(46);
const stickyHeight = ref(0);
const tabs = [
  { label: '查询条件', value: 'search' },
  { label: '待确认单据', value: 'pending' },
  { label: '结果提示', value: 'result' },
];

const getNavEl = () => navRef.value?.getNavEl?.();
const paginationStickyTop = computed(() => navHeight.value + stickyHeight.value);

const measureNavHeight = () => {
  const navEl = getNavEl();
  const height = navEl?.offsetHeight ?? 46;
  navHeight.value = height;
  tabsOffsetTop.value = height;
};

const resolveElement = (target) => {
  if (!target) return null;
  if (target instanceof HTMLElement) return target;
  if (target.$el instanceof HTMLElement) return target.$el;
  if (target?.value) return resolveElement(target.value);
  if (target?.$?.subTree?.el instanceof HTMLElement) return target.$?.subTree?.el;
  return null;
};

const measureStickyHeight = () => {
  nextTick(() => {
    const el = resolveElement(stickyRef.value) || resolveElement(stickyInnerRef.value);
    const rect = el?.getBoundingClientRect();
    stickyHeight.value = rect?.height ?? 0;
  });
};

const handleResize = () => {
  measureNavHeight();
  measureStickyHeight();
};

onMounted(() => {
  measureNavHeight();
  measureStickyHeight();
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('orientationchange', handleResize);
});

watch(activeTab, () => {
  if (activeTab.value === 'pending') {
    measureStickyHeight();
  }
});

watch(tabsRef, () => {
  measureStickyHeight();
});

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
  padding: 12px 16px 16px;
  box-sizing: border-box;
}

.confirm-material__sticky {
  padding-bottom: 12px;
  background: #f7f8fa;
  box-sizing: border-box;
  z-index: 9;
}

.confirm-material__tabs {
  --van-tabs-bottom-bar-color: transparent;
  --van-tabs-line-height: 0;
  background: #fff;
  border-radius: 999px;
  padding: 4px;
  box-shadow: 0 6px 16px rgba(31, 35, 41, 0.08);
}

:deep(.van-tabs__wrap) {
  height: auto;
}

:deep(.van-tabs__nav--line) {
  padding-bottom: 0;
}

:deep(.van-tab) {
  font-size: 14px;
  color: #646566;
  padding: 6px 18px;
  border-radius: 999px;
  transition: background 0.2s ease, color 0.2s ease;
}

:deep(.van-tab--active) {
  background: linear-gradient(135deg, #1989fa, #1668dc);
  color: #fff;
}
</style>
