<template>
  <div class="nameplate-binding">
    <div class="nameplate-binding__content">
      <CardList v-if="hasProduct" :list="productList" />
      <wf-empty v-else text="暂无数据" />

      <van-field
        v-model="snCode"
        label="SN码"
        placeholder="请输入SN码"
        clearable
        class="nameplate-binding__field"
        @keyup.enter="handleManualConfirm"
      />
    </div>

    <div class="nameplate-binding__footer">
      <van-button
        v-if="!btnState"
        type="primary"
        block
        :disabled="disable"
        @click="handleSubmit"
      >
        绑定
      </van-button>
      <van-button v-else type="primary" block @click="handleSubmit">
        解绑
      </van-button>
    </div>

    <dc-drag-button :bottom="400" :loading="scanLoading" @click="handleScanClick">
      <van-icon name="scan" size="34" />
    </dc-drag-button>

    <dc-scan-code
      v-if="scanVisible"
      ref="scanCodeRef"
      @confirm="handleScanConfirm"
      @error="handleScanError"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue';
import { showConfirmDialog, showLoadingToast, showToast } from 'vant';

import Api from '@/api';

import CardList from './components/CardList.vue';

const snCode = ref('');
const productList = ref({});
const step = ref(0);
const disable = ref(true);
const btnState = ref(false);
const scanVisible = ref(false);
const scanLoading = ref(false);
const scanCodeRef = ref(null);

const hasProduct = computed(() => Object.keys(productList.value || {}).length > 0);

const resetState = () => {
  productList.value = {};
  btnState.value = false;
  step.value = 0;
  disable.value = true;
};

const handleScanConfirm = (code) => {
  if (!code) return;
  snCode.value = code;
  indeCode();
};

const handleScanError = (error) => {
  const message = error?.message || '';
  const normalized = message.trim();
  if (normalized.toLowerCase().includes('cancel') || normalized.includes('取消')) {
    return;
  }
  showToast({
    type: 'fail',
    message: `扫码失败: ${normalized || '未知错误'}`,
    duration: 3000,
  });
};

const handleScanClick = async () => {
  try {
    scanLoading.value = true;
    scanVisible.value = true;
    await nextTick();
    const code = await scanCodeRef.value?.open?.();
    if (code) {
      handleScanConfirm(code);
    }
  } catch (error) {
    handleScanError(error);
  } finally {
    scanVisible.value = false;
    scanLoading.value = false;
  }
};

const handleManualConfirm = () => {
  if (!snCode.value) {
    showToast({ type: 'fail', message: '请输入SN码' });
    return;
  }
  indeCode();
};

const indeCode = () => {
  if (!snCode.value) return;
  Api.qms.sn.SnRecordCode(snCode.value).then((res) => {
    const { data } = res || {};
    stepFunc(data);
  });
};

const stepFunc = (data) => {
  if (step.value === 0) {
    if (!data) {
      showToast({ type: 'fail', message: '请先扫SN码', duration: 2000 });
      return;
    }
    if (data.code && data.bindCustomerNameplate) {
      productList.value = data;
      btnState.value = true;
      disable.value = false;
      return;
    }
    if (data.code) {
      step.value = 1;
      productList.value = data;
      btnState.value = false;
      disable.value = true;
      showToast({ type: 'success', message: '请继续扫描铭牌', duration: 2000 });
    }
  } else {
    productList.value = {
      ...productList.value,
      bindCustomerNameplate: snCode.value,
    };
    btnState.value = false;
    disable.value = false;
  }
};

const submitSureData = async () => {
  const loading = showLoadingToast({ message: '提交中...', duration: 0, forbidClick: true });
  try {
    const payload = {
      ...productList.value,
      bindCustomerNameplate: btnState.value
        ? null
        : (productList.value.bindCustomerNameplate || '').replace(/\n/g, ''),
    };
    const res = await Api.qms.sn.SnRecordsubmit(payload);
    if (res?.code === 200) {
      showToast({ type: 'success', message: '操作成功', duration: 2000 });
      resetState();
      snCode.value = '';
    }
  } finally {
    loading.close();
  }
};

const handleSubmit = async () => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确认要执行此操作吗？',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
    });
    await submitSureData();
  } catch {
    // 用户取消操作或发生错误时无需额外处理
  }
};
</script>

<style scoped lang="scss">
.nameplate-binding {
  min-height: 100vh;
  padding-bottom: calc(env(safe-area-inset-bottom) + 96px);
  background: linear-gradient(180deg, #d2dff7 0%, rgba(255, 255, 255, 0) 100%);

  &__content {
    padding: 20px 16px 120px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__field {
    background: #fff;
    border-radius: 12px;
    padding: 12px 16px;
  }

  &__footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 16px 16px calc(env(safe-area-inset-bottom) + 16px);
    background-color: #fff;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
  }
}
</style>
