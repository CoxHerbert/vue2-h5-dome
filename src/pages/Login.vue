<template>
  <div class="page">
    <h2>登录</h2>
    <van-field v-model="username" label="用户名" placeholder="请输入用户名" />
    <van-field v-model="password" type="password" label="密码" placeholder="请输入密码" />
    <van-button type="primary" class="mt" @click="doLogin" v-anti-click>登录</van-button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { showToast } from 'vant';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const username = ref('');
const password = ref('');

function doLogin() {
  if (auth.login({ username: username.value, password: password.value })) {
    showToast('登录成功');
    const redirect = route.query.redirect || '/';
    router.replace(String(redirect));
  } else {
    showToast('登录失败');
  }
}
</script>

<style scoped>
.page { padding: 16px; }
.mt { margin-top: 12px; width: 100%; }
</style>
