<!-- src/pages/login/social.vue -->
<template>
  <div class="wx-social-page">
    <div class="card">
      <p>正在登录中…</p>
      <p v-if="err" style="color: #d00">登录失败：{{ err }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { gotoWechatAuthorize, stripWxParams } from '@/utils/wechat-auth.js';
import Api from '@/api';

const err = ref('');

function q(name) {
  return new URLSearchParams(location.search).get(name) || '';
}
function safeGo(url) {
  location.replace(stripWxParams(url || '/'));
}

onMounted(async () => {
  const code = q('code');
  const state = q('state');
  const callbackUrl = q('callbackUrl') || '/';

  if (!code) return safeGo(callbackUrl);

  try {
    // 用 code 换登录态（后端现成）
    await Api.auth.loginByCode({ code, state });
    safeGo(callbackUrl);
  } catch (e) {
    const msg =
      (e && e.message) ||
      (e && e.response && e.response.data && (e.response.data.msg || e.response.data.message)) ||
      '登录失败';
    err.value = msg;

    // 40163：code 被用过；40029：invalid code —— 重新静默授权
    if (/40163|40029|invalid|code/i.test(msg)) {
      const back = location.origin + location.pathname + location.search;
      try {
        await gotoWechatAuthorize(back, { scope: 'base' });
      } catch (err) {
        console.error(err);
      }
    }
  }
});
</script>

<style scoped>
.wx-social-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
.card {
  font-size: 14px;
  color: #333;
}
</style>
