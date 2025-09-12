<!-- src/views/login/WeChatLogin.vue -->
<template>
  <div class="sso">
    <div class="brand-wechat">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M18.4 10.2c0-3.2-3.2-5.8-7.1-5.8C7.3 4.4 4 7 4 10.2c0 1.9 1.1 3.6 2.8 4.7l-.6 2.1 2.2-1.2c.7.2 1.5.3 2.3.3 3.9 0 7.1-2.6 7.1-5.9z"
          fill="#09BB07"
        />
        <circle cx="9" cy="10" r="0.8" fill="#fff" />
        <circle cx="13" cy="10" r="0.8" fill="#fff" />
      </svg>
      <span>微信登录</span>
    </div>

    <div v-if="env !== 'wechat'" class="hint">
      <van-empty description="请在微信内打开此页面以继续微信登录">
        <van-button size="small" type="primary" @click="copyAuthUrl">复制授权链接</van-button>
      </van-empty>
    </div>

    <div v-else class="action">
      <van-button type="primary" round block @click="goWeChat">使用微信授权登录</van-button>
      <p class="muted">将跳转至微信授权页，授权后自动返回本页面</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getLoginEnv } from '@/utils/env';
import { showToast } from 'vant';

const AUTH_URL = '/api/auth/wechat/authorize';
const env = ref('h5');

function mapEnvToType(e) {
  if (e === 'wechat_enterprise') return 'wechat_enterprise';
  if (e === 'wechat_open' || e === 'wechat_open_pc') return 'wechat_open';
  return 'h5';
}
function hasLogin() {
  return document.cookie.includes('sid=') || !!localStorage.getItem('token');
}
function buildAuthorizeUrl(finalUrl) {
  const type = mapEnvToType(env.value);
  const qs = new URLSearchParams({ redirectUrl: finalUrl, scope: 'base', type }).toString();
  return `${AUTH_URL}?${qs}`;
}
function goWeChat() {
  const url = buildAuthorizeUrl(location.href);
  if (sessionStorage.getItem('wx_authing') !== '1') {
    sessionStorage.setItem('wx_authing', '1');
    location.replace(url);
  }
}
async function copyAuthUrl() {
  const url = buildAuthorizeUrl(location.href);
  try {
    await navigator.clipboard.writeText(url.startsWith('http') ? url : location.origin + url);
    showToast('已复制授权链接');
  } catch {
    showToast('复制失败，请手动复制');
  }
}

onMounted(async () => {
  env.value = getLoginEnv();
  if (
    (env.value === 'wechat_open' ||
      env.value === 'wechat_enterprise' ||
      env.value === 'wechat_open_pc') &&
    !hasLogin()
  ) {
    goWeChat();
  }
});
</script>

<style scoped>
.sso {
  padding: 12px;
  text-align: center;
}
.brand-wechat {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  background: #f0fff0;
  color: #16a34a;
  font-weight: 600;
  margin-bottom: 12px;
}
.hint {
  margin-top: 10px;
}
.action {
  margin-top: 6px;
}
.muted {
  color: #94a3b8;
  font-size: 12px;
  margin-top: 8px;
}
</style>
