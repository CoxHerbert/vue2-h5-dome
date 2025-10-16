<template>
  <div class="tab-layout">
    <router-view class="tab-content" />

    <!-- 交给路由控制选中，无需 v-model -->
    <van-tabbar route>
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
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import router from '@/router';

// 只拿需要出现在底部的叶子路由
const tabRoutes = computed(() => router.getRoutes().filter((r) => r.meta?.tabbar && r.name));

const { t } = useI18n();
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
</style>
