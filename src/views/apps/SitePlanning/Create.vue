<template>
  <div class="site-planning-create">
    <dc-nav-bar title="现场计划单" fixed left-arrow @click-left="handleBack" />

    <div class="base-wrapper mtop20">
      <div class="title">{{ form.orderCode || '-' }}</div>
      <div class="baseinfo">
        <van-card class="info-card" :border="false">
          <template #title>
            <div class="info-card__title">基础信息</div>
          </template>

          <template #desc>
            <van-cell-group>
              <van-field label="阶段编码" :model-value="form.phaseCode || ''" readonly />
              <van-field label="阶段名称" :model-value="form.phaseName || ''" readonly />
              <van-field label="开始时间" :model-value="form.startDate || ''" readonly />
              <van-field label="结束时间" :model-value="form.endDate || ''" readonly />
              <van-field
                v-model="form.overdueExplanation"
                label="延期说明"
                type="textarea"
                rows="2"
                autosize
                maxlength="200"
                show-word-limit
                placeholder="请输入"
              />
            </van-cell-group>
          </template>

          <template #footer>
            <van-button block type="primary" class="save-btn" :loading="submitting" @click="handleSave">
              保存
            </van-button>
          </template>
        </van-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';

import Api from '@/api';

const route = useRoute();
const router = useRouter();

const form = reactive({
  orderCode: '',
  phaseCode: '',
  phaseName: '',
  startDate: '',
  endDate: '',
  overdueExplanation: '',
});

const submitting = ref(false);

onMounted(() => {
  fetchDetail();
});

async function fetchDetail() {
  const id = route.query?.id;
  if (!id) return;

  try {
    const res = await Api.application.planSheep.detail({ id });
    const data = res?.data?.data ?? res?.data ?? {};
    Object.assign(form, {
      orderCode: '',
      phaseCode: '',
      phaseName: '',
      startDate: '',
      endDate: '',
      ...data,
      overdueExplanation: data?.overdueExplanation ?? '',
    });
  } catch (error) {
    console.error(error);
    showToast('获取详情失败');
  }
}

function handleBack() {
  router.back();
}

async function handleSave() {
  if (submitting.value) return;

  try {
    await showConfirmDialog({
      title: '提示',
      message: '确认保存吗',
    });
  } catch {
    return;
  }

  submitting.value = true;
  try {
    const res = await Api.application.planSheep.submit({ ...form });
    const code = res?.data?.code ?? res?.status;
    const success = res?.data?.success ?? code === 200;
    const message = res?.data?.msg || (success ? '保存成功' : '保存失败');

    showToast(message);

    if (success) {
      setTimeout(() => {
        router.back();
      }, 600);
    }
  } catch (error) {
    console.error(error);
    showToast('系统异常');
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.site-planning-create {
  background: linear-gradient(180deg, #f7e9df 0%, rgba(255, 255, 255, 0) 12%) !important;
  min-height: 100vh;
  padding-bottom: 200rpx;
  box-sizing: border-box;

  .title {
    font-weight: 600;
    font-size: 30rpx;
    line-height: 30rpx;
    margin-bottom: 32rpx;
  }

  .mtop20 {
    margin-top: 20rpx;
  }

  .base-wrapper {
    padding: 0 26rpx;
    box-sizing: border-box;

    .baseinfo {
      padding-bottom: 48rpx;
      box-sizing: border-box;

      .info-card {
        --van-card-background: #fff;
        border-radius: 20rpx;
        overflow: hidden;
        box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);

        :deep(.van-card__header) {
          padding: 32rpx 24rpx 0;
        }

        :deep(.van-card__content) {
          padding: 0 24rpx 32rpx;
        }

        :deep(.van-card__desc) {
          margin-top: 24rpx;
        }

        :deep(.van-cell-group) {
          background-color: transparent;
        }

        :deep(.van-card__footer) {
          padding: 0 24rpx 32rpx;
        }
      }

      .info-card__title {
        font-size: 28rpx;
        font-weight: 600;
        color: #222;
      }

      .save-btn {
        margin-top: 32rpx;
        border-radius: 8rpx;
      }
    }
  }
}
</style>
