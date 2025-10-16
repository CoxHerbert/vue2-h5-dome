<template>
  <div class="tab-layout">
    <div ref="scrollContainer" class="tab-content">
      <router-view />
    </div>

    <!-- 交给路由控制选中，无需 v-model -->
    <van-tabbar route :class="{ 'tabbar--hidden': isTabbarHidden }">
      <van-tabbar-item
        v-for="r in tabRoutes"
        :key="r.name"
        :to="{ name: r.name }"
        :icon="r.meta.icon"
      >
        {{ t(r.meta.title) }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import router from '@/router';

// 只拿需要出现在底部的叶子路由
const tabRoutes = computed(() => router.getRoutes().filter((r) => r.meta?.tabbar && r.name));

const { t } = useI18n();

const scrollContainer = ref();
const isTabbarHidden = ref(false);
let lastScrollTop = 0;
let rafId = null;
const requestFrame =
  typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame.bind(window)
    : (cb) => setTimeout(cb, 16);
const cancelFrame =
  typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function'
    ? window.cancelAnimationFrame.bind(window)
    : (id) => clearTimeout(id);

const updateTabbarVisible = () => {
  const el = scrollContainer.value;
  if (!el) return;

  const currentScrollTop = el.scrollTop;
  const delta = currentScrollTop - lastScrollTop;
  const threshold = 8;

  if (currentScrollTop <= 0) {
    isTabbarHidden.value = false;
  } else if (Math.abs(delta) > threshold) {
    isTabbarHidden.value = delta > 0;
  }

  lastScrollTop = currentScrollTop;
};

const onScroll = () => {
  if (rafId !== null) return;

  rafId = requestFrame(() => {
    updateTabbarVisible();
    rafId = null;
  });
};

const cleanup = () => {
  const el = scrollContainer.value;
  if (el) {
    el.removeEventListener('scroll', onScroll);
  }

  if (rafId !== null) {
    cancelFrame(rafId);
    rafId = null;
  }
};

onMounted(() => {
  const el = scrollContainer.value;
  if (!el) return;

  lastScrollTop = el.scrollTop;
  el.addEventListener('scroll', onScroll, { passive: true });
});

onBeforeUnmount(() => {
  cleanup();
});

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    isTabbarHidden.value = false;
    lastScrollTop = scrollContainer.value ? scrollContainer.value.scrollTop : 0;
  }
);
</script>

<style scoped>
.tab-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.tab-content {
  flex: 1;
  overflow: auto;
  background: #f7f8fa;
}
.van-tabbar {
  transition: transform 0.3s ease;
  will-change: transform;
}
.tabbar--hidden {
  transform: translateY(100%);
}
</style>
