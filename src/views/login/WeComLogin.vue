<!-- src/views/login/WeComLogin.vue -->
<template>
  <div class="sso">
    <div class="brand-wecom">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 6a2 2 0 0 1 2-2h4v2H6v4H4V6zM14 4h4a2 2 0 0 1 2 2v4h-2V6h-4V4zM4 14h2v4h4v2H6a2 2 0 0 1-2-2v-4zM18 14h2v4a2 2 0 0 1-2 2h-4v-2h4v-4z"
          fill="#1777FF"
        />
      </svg>
      <span>企业微信登录</span>
    </div>

    <div v-if="env !== 'wecom'" class="hint">
      <van-empty description="请在企业微信内打开此页面以继续企业微信登录">
        <van-button size="small" type="primary" @click="copyAuthUrl">复制授权链接</van-button>
      </van-empty>
    </div>

    <div v-else class="action">
      <van-button type="primary" round block @click="goWeCom">使用企业微信授权登录</van-button>
      <p class="muted">将跳转至企业微信授权页，授权后自动返回本页面</p>
    </div>
  </div>
</template>

<script setup>
import { getLoginEnv } from '@/utils/env';
import { showToast } from 'vant';

const env = getLoginEnv();
const AUTH_URL = '/api/auth/wecom/authorize';

function goWeCom() {
  window.location.href = AUTH_URL;
}

async function copyAuthUrl() {
  try {
    await navigator.clipboard.writeText(window.location.origin + AUTH_URL);
    showToast('已复制授权链接');
  } catch (e) {
    showToast('复制失败，请手动复制');
  }
}
</script>

<style scoped>
.sso {
  padding: 12px;
  text-align: center;
}
.brand-wecom {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  background: #eef4ff;
  color: #1677ff;
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
