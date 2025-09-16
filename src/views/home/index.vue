<template>
  <div class="page"><van-nav-bar title="首页" fixed /></div>
</template>
<script setup>
import Api from '@/api/index';
import { onMounted } from 'vue';
import { useUserStore } from '@/store/user';

const user = useUserStore();

onMounted(() => {
  // getDetail();
});

// function getDetail() {
//   const res = Api.recruit.campus.apply.getDetail({ id: user.userInfo.id });
//   const { code, data } = res.data;
//   if (code === 200) {
//     console.log(data);
//   }
// }
</script>
<style lang="scss" scoped></style>
