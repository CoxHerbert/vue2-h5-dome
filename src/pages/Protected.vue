<template>
  <div class="page">
    <h2>受保护页面</h2>
    <p>只有登录后并具有 <code>demo:view</code> 权限的用户可以访问。</p>
    <van-button type="danger" @click="logout">退出登录</van-button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const auth = useAuthStore();
const router = useRouter();
function logout() {
  auth.logout();
  router.replace('/login');
}
</script>

<style scoped>
.page { padding: 16px; }
</style>
