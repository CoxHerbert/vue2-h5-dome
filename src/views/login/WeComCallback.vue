<!-- src/views/login/WeComCallback.vue -->
<template>
  <div class="callback">
    <van-loading size="20" vertical>正在处理企业微信登录…</van-loading>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const error = ref('');

onMounted(async () => {
  const { code, state } = route.query || {};
  if (!code) {
    error.value = '缺少 code 参数';
    return;
  }
  try {
    // const { data } = await axios.get('/api/auth/wecom/callback', { params: { code, state }});
    // authStore.setToken(data.token);
    router.replace('/');
  } catch (e) {
    error.value = '回调处理失败，请重试';
  }
});
</script>

<style scoped>
.callback { padding: 24px; text-align: center; }
.error { color: #ef4444; margin-top: 10px; }
</style>
