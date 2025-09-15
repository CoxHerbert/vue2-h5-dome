<!-- src/views/login/LoginLayout.vue -->
<template>
  <div class="login-page">
    <div class="hero">
      <div class="brand">
        <img class="logo" :src="logoUrl" alt="logo" />
        <div class="meta">
          <h1>欢迎登录</h1>
          <p class="sub">为你提供统一、便捷、安全的登录体验</p>
        </div>
      </div>
    </div>

    <!-- 入口类型提示（来自路由 type/meta.userType） -->
    <van-tag v-if="typeLabel" plain type="success" class="type-tip">
      当前入口：{{ typeLabel }}
    </van-tag>

    <div class="card">
      <!-- 只有一个 tab 时不渲染 tabs，避免多余点击区域 -->
      <van-tabs
        v-if="tabs.length > 1"
        v-model:active="active"
        shrink
        animated
        @change="onTabChange"
      >
        <van-tab v-for="t in tabs" :key="t.name" :title="t.label" :name="t.name" />
      </van-tabs>

      <div class="body">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// —— 常量（用路径，不再依赖路由常量）——
const LOGIN_ACCOUNT_PATH = '/login/account';
const LOGIN_SOCIAL_PATH = '/login/social';

// ==== 类型文案（新增类型在此加一行即可） ====
const TYPE_LABELS = {
  campus_applicant: '校园招聘',
  internal_referral: '内部内推',
  vendor_hr: '供应商HR',
};
const DEFAULT_TYPE = 'campus_applicant';

const router = useRouter();
const route = useRoute();

/** logo 路径兼容二级目录 */
const logoUrl = `${import.meta.env.BASE_URL}images/logo.png`;

/** 入口类型 + 回跳地址（贯穿保留） */
const type = computed(() => {
  return (
    (route.query?.type && String(route.query.type)) ||
    (route.meta?.userType && String(route.meta.userType)) ||
    DEFAULT_TYPE
  );
});

/** 仅做“防回到登录页”的安全规整，不强行把正常地址改成 '/' */
function safeRedirect(raw) {
  try {
    const u = new URL(String(raw || '/'), window.location.origin);
    const isLogin = u.pathname === '/login' || u.pathname.startsWith('/login/');
    return isLogin ? '/' : u.pathname + u.search + u.hash || '/';
  } catch {
    return '/';
  }
}
const redirect = computed(() => safeRedirect(route.query?.redirect));

const typeLabel = computed(() => TYPE_LABELS[type.value] || type.value);

/** 只保留“账号密码”这一项；需要时可以再扩展 */
const tabs = computed(() => [{ name: LOGIN_ACCOUNT_PATH, label: '账号密码' }]);

/** 当前激活 Tab：优先路由名，否则路由路径 */
const active = ref(route.name || route.path);
watch(
  () => [route.name, route.path],
  () => (active.value = route.name || route.path)
);

/** 统一 push：确保每次跳转都保留 type/redirect；避免无意义重复导航 */
function pushWithLoginQuery(target) {
  const mergedQuery = {
    ...route.query,
    type: type.value,
    redirect: redirect.value || '/',
  };

  // 构造待跳转的 location
  const nextLoc =
    typeof target === 'string'
      ? { path: target, query: mergedQuery }
      : target.name
        ? { name: target.name, query: { ...(target.query || {}), ...mergedQuery } }
        : { path: target.path, query: { ...(target.query || {}), ...mergedQuery } };

  // 若目标等于当前，不再跳
  const resolved = router.resolve(nextLoc);
  if (resolved.fullPath === route.fullPath) return;

  router.push(nextLoc);
}

/** 切换 Tab 时不丢 query（这里只有一个 Tab，兜底写死跳 account） */
function onTabChange(name) {
  if (!name) return;
  if (name === (route.name || route.path)) return;
  pushWithLoginQuery({ path: LOGIN_ACCOUNT_PATH });
}

/** 首次进入：若 meta.userType 有值而 URL 未带 type，则补齐（只做一次） */
let hydrated = false;
onMounted(() => {
  if (hydrated) return;
  hydrated = true;

  // if (!route.query?.type && route.meta?.userType) {
  //   router.replace({
  //     // 用当前路由（名或路径都兼容）
  //     name: route.name,
  //     path: route.name ? undefined : route.path,
  //     query: { ...route.query, type: String(route.meta.userType), redirect: redirect.value || '/' },
  //   });
  // }
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background:
    radial-gradient(1200px 500px at 90% -20%, rgba(64, 158, 255, 0.25), transparent 50%),
    radial-gradient(800px 400px at -10% 10%, rgba(64, 158, 255, 0.15), transparent 50%),
    linear-gradient(180deg, #f7fbff 0%, #f8fafc 20%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 14px;
  box-sizing: border-box;
}
.hero {
  width: min(960px, 92%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0 8px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #fff;
  display: grid;
  place-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}
.meta h1 {
  margin: 0;
  font-size: 20px;
  color: #0f172a;
}
.sub {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 13px;
}

.type-tip {
  margin-bottom: 12px;
  border-color: #16a34a;
  color: #16a34a;
}
.card {
  width: min(960px, 92%);
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 20px 60px rgba(2, 6, 23, 0.08);
  overflow: hidden;
}
.body {
  min-height: 260px;
}
.quick :deep(.van-button) {
  box-shadow: 0 6px 20px rgba(22, 119, 255, 0.18);
}
</style>
