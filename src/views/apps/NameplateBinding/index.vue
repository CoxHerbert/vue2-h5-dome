<!-- src/views/nameplate-binding/index.vue -->
<template>
  <div class="nameplate-binding">
    <!-- 顶部导航 -->
    <van-nav-bar left-arrow title="铭牌绑定" class="np-navbar" @click-left="handleBack" />

    <!-- 内容（搜索不吸顶） -->
    <div class="nameplate-binding__content">
      <!-- 搜索框 -->
      <div class="search-bar">
        <DcSearchBar
          v-model="snCode"
          placeholder="请输入 SN 码 或 铭牌码"
          button-text="搜索"
          background="#f7f8fa"
          @search="handleSearch"
        />
      </div>

      <!-- 铭牌信息卡 / 空态 -->
      <div v-if="hasProduct" class="nameplate-card">
        <div class="nameplate-card__header">
          <img class="brand" :src="withBase('/images/logo.png')" alt="logo" />
          <span class="nameplate-card__title">Name: {{ list.materialName || '-' }}</span>
        </div>
        <van-divider />
        <div class="nameplate-card__body">
          <div class="nameplate-card__info">
            <div class="info-row">
              <span class="label">P.Code:</span>
              <span class="value">{{ list.materialNum || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">SN:</span>
              <span class="value">{{ list.code || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">铭牌:</span>
              <span
                class="value"
                :class="{ 'value--success': hasNameplate, 'value--warning': !hasNameplate }"
              >
                {{ nameplateText }}
              </span>
            </div>
            <div class="info-row">
              <span class="label">专案号:</span>
              <span class="value">{{ list.mtoNo || '-' }}</span>
            </div>
          </div>

          <div v-if="list.code" class="nameplate-card__qr" aria-label="二维码">
            <div class="qr-box">
              <qrcode-vue
                :value="list.code"
                :size="qrSize"
                render-as="svg"
                level="M"
                :margin="1"
                :background="qrBg"
                :foreground="qrFg"
              />
            </div>
          </div>
        </div>
        <van-divider />
      </div>
      <van-empty v-else description="暂无数据" />
    </div>

    <!-- 底部操作 -->
    <div ref="footerRef" class="nameplate-binding__footer">
      <van-button v-if="!btnState" type="primary" block :disabled="disable" @click="handleSubmit">
        绑定
      </van-button>
      <van-button v-else type="primary" block @click="handleSubmit"> 解绑 </van-button>
    </div>

    <!-- 悬浮：扫码（只显示 icon；避开底部按钮） -->
    <dc-scan-code v-model="snCode" @confirm="handleScanSuccess" @error="handleScanError">
      <template #default="{ open, disabled, loading }">
        <van-floating-bubble
          class="float-bubble"
          :class="{ 'is-disabled': disabled || loading }"
          :offset="scanBubbleOffset"
          axis="xy"
          magnetic="x"
          @click="open"
        >
          <van-icon name="scan" size="22" />
        </van-floating-bubble>
      </template>
    </dc-scan-code>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import QrcodeVue from 'qrcode.vue';
import { showConfirmDialog, showLoadingToast, showToast } from 'vant';
import Api from '@/api';
import { withBase } from '@/utils/util';
import DcSearchBar from '@/components/dc-ui/components/SearchBar/index.vue';

// 页面状态
const snCode = ref('');
const productList = ref({});
const step = ref(0);
const disable = ref(true);
const btnState = ref(false); // false=绑定, true=解绑

const hasProduct = computed(() => Object.keys(productList.value || {}).length > 0);
const list = computed(() => productList.value || {});

// 铭牌卡片
const qrSize = 108;
const qrBg = '#FFFFFF';
const qrFg = '#111111';

const nameplateText = computed(() => list.value?.bindCustomerNameplate || '当前铭牌不存在');
const hasNameplate = computed(() => Boolean(list.value?.bindCustomerNameplate));

// 底部高度测量，避免浮窗重叠
const footerRef = ref(null);
const footerH = ref(96);

// 仅保留扫码浮窗（不再有回到顶部）
const scanBubbleOffset = ref({ x: 16, y: 120 });

const measureFooter = () => {
  footerH.value = footerRef.value?.offsetHeight || 96;
};

const placeBubbles = () => {
  const w = document.documentElement.clientWidth || window.innerWidth || 375;
  const h = document.documentElement.clientHeight || window.innerHeight || 667;
  const SIZE = 56;
  const GAP = 16;

  // 扫码按钮：右下角且避开底部容器
  scanBubbleOffset.value = { x: w - SIZE - GAP, y: h - SIZE - GAP - footerH.value };
};

const onResize = () => {
  measureFooter();
  placeBubbles();
};

onMounted(async () => {
  await nextTick();
  measureFooter();
  placeBubbles();
  window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
});

// 交互
const handleBack = () => {
  if (history.length > 1) history.back();
  else window.location.href = '/';
};

const handleSearch = () => {
  const code = snCode.value?.toString().trim();
  if (!code) {
    showToast({ type: 'fail', message: '请输入SN码或铭牌码' });
    return;
  }
  snCode.value = code;
  indeCode();
};

const handleScanError = (error) => {
  const msg = (error?.message || '').trim();
  if (msg.toLowerCase().includes('cancel') || msg.includes('取消')) return;
  showToast({ type: 'fail', message: `扫码失败: ${msg || '未知错误'}`, duration: 3000 });
};

const handleScanSuccess = (code) => {
  if (!code) return;
  snCode.value = code;
  indeCode();
};

// 查询 & 提交
const indeCode = async () => {
  if (!snCode.value) return;
  try {
    const res = await Api.application.nameplateBinding.SnRecordCode(snCode.value);
    const { code: statusCode, data, msg } = res?.data || {};
    if (statusCode !== 200) {
      showToast({ type: 'fail', message: msg || 'SN码查询失败', duration: 2000 });
      return;
    }
    stepFunc(data);
  } catch (e) {
    showToast({ type: 'fail', message: e?.message || 'SN码查询失败', duration: 2000 });
  }
};

const stepFunc = (data) => {
  if (step.value === 0) {
    if (!data) {
      showToast({ type: 'fail', message: '请先输入或扫描SN码', duration: 2000 });
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
    const res = await Api.application.nameplateBinding.SnRecordsubmit(payload);
    const { code: statusCode, msg } = res?.data || {};
    if (statusCode === 200) {
      showToast({ type: 'success', message: '操作成功', duration: 2000 });
      productList.value = {};
      btnState.value = false;
      step.value = 0;
      disable.value = true;
      snCode.value = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast({ type: 'fail', message: msg || '操作失败', duration: 2000 });
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
  } catch (error) {
    console.debug('submit canceled', error);
  }
};
</script>

<style scoped lang="scss">
:root {
  --nav-h: 46px;
}

.nameplate-binding {
  min-height: 100vh;
  overflow-x: hidden;
  background: linear-gradient(180deg, #d2dff7 0%, rgba(255, 255, 255, 0) 100%);
  padding-bottom: calc(env(safe-area-inset-bottom) + 96px);
}

.np-navbar {
  height: var(--nav-h);
}

/* 内容：给固定 NavBar 留出空间；搜索不吸顶 */
.nameplate-binding__content {
  padding: calc(var(--nav-h) + 8px) 16px 120px;
  box-sizing: border-box;
}

/* 搜索条样式（普通流式） */
.search-bar {
  margin-bottom: 12px;

  .btn-search {
    padding: 0 8px;
    color: #155bd4;
    font-weight: 600;
  }
}

/* 铭牌信息卡 */
.nameplate-card {
  background-color: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  margin: 0 10px 10px;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;

    .brand {
      width: 34px;
      object-fit: contain;
      border-radius: 6px;
      flex: 0 0 24px;
    }
  }

  &__title {
    font-size: 16px;
    font-weight: 700;
    flex: 1;
  }
  &__body {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }
  &__info {
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 14px;
    flex: 1;
    min-width: 0;
  }
  &__qr {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    .qr-box {
      padding: 6px;
      border: 1px solid #f0f0f0;
      border-radius: 12px;
      background: #fff;
      line-height: 0;
    }
  }
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;

  .label {
    color: #666;
    min-width: 72px;
    font-weight: 700;
  }
  .value {
    color: #333;
    word-break: break-all;
    font-weight: 700;
  }
  .value--success {
    color: #07c160;
  }
  .value--warning {
    color: #ee0a24;
  }
}

/* 底部按钮容器（贴合屏宽，不超出） */
.nameplate-binding__footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  box-sizing: border-box;
  width: 100%;
  max-width: 100vw;
  padding: 16px 16px calc(env(safe-area-inset-bottom) + 16px);
  background-color: #fff;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);

  :deep(.van-button) {
    width: 100%;
  }
}

/* 悬浮按钮（仅扫码），offset 由 JS 计算避免与 footer 重叠 */
.float-bubble {
  z-index: 999;
  :deep(.van-floating-bubble) {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
</style>
