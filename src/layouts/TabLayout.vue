<template>
  <div class="tab-layout">
    <router-view class="tab-content" />

    <!-- 仅在 /home /me /apps 三个路由下显示 -->
    <van-tabbar v-if="showTabbar" route>
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
import { useRoute } from 'vue-router';
import router from '@/router';

const { t } = useI18n();
const route = useRoute();

// 只拿需要出现在底部的叶子路由
const tabRoutes = computed(() => router.getRoutes().filter((r) => r.meta?.tabbar && r.name));

// 仅当当前路径 === /home 或 /me 或 /apps 时显示 TabBar（严格匹配）
const ALLOW_PATHS = ['/home', '/me', '/apps', '/'];
const showTabbar = computed(() => ALLOW_PATHS.some((p) => route.path === p));
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
