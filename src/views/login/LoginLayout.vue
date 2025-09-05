<!-- src/views/login/LoginLayout.vue -->
<template>
  <div class="login-page">
    <div class="hero">
      <div class="brand">
        <img class="logo" src="/images/logo.png" alt="logo" />
        <div class="meta">
          <h1>欢迎登录</h1>
          <p class="sub">为你提供统一、便捷、安全的登录体验</p>
        </div>
      </div>
      <van-tag v-if="envTip" round type="primary" class="env-tip">
        {{ envTip }}
      </van-tag>
    </div>

    <div class="card">
      <van-tabs v-model:active="active" shrink animated @change="onTabChange">
        <van-tab v-for="t in tabs" :key="t.name" :title="t.label" :name="t.name" />
      </van-tabs>
      <div class="body">
        <router-view />
      </div>
      <div class="footer">
        <span class="muted">登录即代表同意</span>
        <a href="javascript:void(0)" class="link">《用户协议》</a>
        <span class="muted">和</span>
        <a href="javascript:void(0)" class="link">《隐私政策》</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ROUTE_NAME from '@/router/route-names';
import { getLoginEnv } from '@/utils/env';

const router = useRouter();
const route = useRoute();

const env = getLoginEnv();
const envTip = computed(() => {
  if (env === 'wechat') return '已检测到微信环境，推荐使用微信免密登录';
  if (env === 'wecom') return '已检测到企业微信环境，推荐使用企业微信快速登录';
  return '';
});

const tabs = computed(() => {
  const base = [
    { name: ROUTE_NAME.LOGIN_ACCOUNT, label: '账号密码' },
    { name: ROUTE_NAME.LOGIN_PHONE, label: '短信登录' },
  ];
  if (env === 'wechat') base.push({ name: ROUTE_NAME.LOGIN_WECHAT, label: '微信登录' });
  if (env === 'wecom') base.push({ name: ROUTE_NAME.LOGIN_WECOM, label: '企业微信登录' });
  return base;
});

const active = ref(route.name);

watch(
  () => route.name,
  (n) => {
    active.value = n;
  }
);

function onTabChange(name) {
  if (name && name !== route.name) {
    router.push({ name });
  }
}

// 可选：自动跳转到更合适的 SSO 方式（默认关闭，避免打断体验）
const AUTO_REDIRECT_SSO = false;

onMounted(() => {
  if (!AUTO_REDIRECT_SSO) return;
  if (env === 'wechat' && route.name === ROUTE_NAME.LOGIN_ACCOUNT) {
    router.replace({ name: ROUTE_NAME.LOGIN_WECHAT });
  } else if (env === 'wecom' && route.name === ROUTE_NAME.LOGIN_ACCOUNT) {
    router.replace({ name: ROUTE_NAME.LOGIN_WECOM });
  }
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
  margin: 12px 0 20px;
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
.env-tip {
  border: none;
  background: #e6f2ff;
  color: #1677ff;
  padding: 6px 10px;
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
.footer {
  padding: 8px 14px 16px;
  text-align: center;
}
.link {
  color: #1677ff;
  text-decoration: none;
}
.muted {
  color: #94a3b8;
}
</style>
