<template>
  <div class="page">
    <h2>Home</h2>
    <div class="links">
      <router-link to="/login"> 去登录 </router-link>
      <router-link to="/protected"> 受保护页面 </router-link>
    </div>

    <h3>上传组件（自动上传示例）</h3>
    <Upload />
  </div>
</template>

<script setup></script>

<style scoped>
.page {
  padding: 16px;
}
.links {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}
</style>
