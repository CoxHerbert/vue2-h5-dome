<template>
  <div class="self-outbound-submit">
    <dc-nav-bar title="出库提交" left-arrow @click-left="handleBack" />
    <div class="self-outbound-submit__body">
      <van-empty description="表单配置暂未完成" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

defineOptions({ name: 'SelfOutboundSubmit' });

const router = useRouter();

function handleBack() {
  router.back();
}
</script>

<style lang="scss" scoped>
.self-outbound-submit {
  min-height: 100vh;
  background: #f7f8fa;
  display: flex;
  flex-direction: column;

  &__body {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
}
</style>
