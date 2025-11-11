<template>
  <div class="debug-settings">
    <dc-nav-bar title="调试设置" left-arrow @click-left="handleBack" />

    <section class="debug-settings__content">
      <van-cell-group inset>
        <van-cell
          title="VConsole 调试面板"
          label="开启后可在页面底部展开调试工具"
          class="debug-settings__cell"
        >
          <template #right-icon>
            <van-switch
              :model-value="debugStore.vconsoleEnabled"
              :loading="loading"
              size="24px"
              @update:model-value="onToggle"
            />
          </template>
        </van-cell>
      </van-cell-group>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { showFailToast, showToast } from 'vant';
import { useRouter } from 'vue-router';
import { useDebugStore } from '@/store/debug';

const router = useRouter();
const debugStore = useDebugStore();
const loading = ref(false);

const handleBack = () => {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.replace('/');
};

const onToggle = async (value) => {
  if (loading.value) return;
  loading.value = true;
  try {
    await debugStore.setVConsoleEnabled(value);
    showToast({
      message: value ? 'VConsole 已开启' : 'VConsole 已关闭',
      duration: 800,
    });
  } catch (error) {
    console.warn('[debug] toggle failed', error);
    showFailToast({ message: 'VConsole 加载失败，请稍后重试' });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  debugStore.init();
});
</script>

<style scoped lang="scss">
.debug-settings {
  min-height: 100vh;
  background-color: #f7f8fa;

  &__content {
    padding: 16px 0;
  }

  &__cell {
    align-items: center;
  }
}
</style>
