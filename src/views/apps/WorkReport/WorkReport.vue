<template>
  <div class="work-report page">
    <dc-nav-bar title="工时汇报" fixed left-arrow @click-left="handleBack" />

    <div class="work-report__content">
      <div class="work-report__search">
        <van-search
          v-model="snCode"
          placeholder="请输入SN码查询"
          shape="square"
          :show-action="false"
          @search="handleSearch"
        />
        <van-button type="success" class="work-report__button" @click="handleSearch">
          <van-icon name="search" size="18" /> 查询
        </van-button>
        <van-button type="primary" class="work-report__button" @click="openScan">
          <van-icon name="scan" size="18" />
        </van-button>
      </div>

      <van-tabs v-model:active="activeTab" class="work-report__tabs">
        <van-tab title="专案详情" name="detail">
          <ProjectOverview
            :plan-info="planInfo"
            :color-enum="colorEnum"
            @jump="handleJump"
          />
        </van-tab>
        <van-tab title="填报工时" name="report">
          <div class="work-report__list">
            <template v-if="workRoutes.length">
              <WorkRouteCard
                v-for="route in workRoutes"
                :key="route.produceRouteId"
                :route="route"
                @toggle-complete="updateRouteComplete"
                @change-report-hour="updateReportHour"
                @change-report-qty="updateReportQty"
              />
            </template>
            <van-empty v-else description="暂无数据" />
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <div v-if="activeTab === 'report'" class="work-report__footer">
      <van-button block type="success" @click="handleSubmit">
        <van-icon name="passed" size="18" /> 提交
      </van-button>
    </div>

    <dc-scan-code v-if="showScan" ref="scanCodeRef" @confirm="handleScanConfirm" />
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showFailToast, showLoadingToast, showSuccessToast } from 'vant';
import Api from '@/api';
import ProjectOverview from './components/ProjectOverview.vue';
import WorkRouteCard from './components/WorkRouteCard.vue';

const router = useRouter();

const snCode = ref('');
const activeTab = ref('detail');
const planInfo = reactive({});
const workRoutes = ref([]);
const showScan = ref(false);
const scanCodeRef = ref();

const colorEnum = {
  延期: '#e12137',
  完成: 'green',
  进行中: '#1d65f3',
};

const hasRouteData = computed(() => workRoutes.value.some((route) => (route.children || []).length));

const resetData = () => {
  Object.keys(planInfo).forEach((key) => delete planInfo[key]);
  workRoutes.value = [];
};

const fetchPlanId = async () => {
  const { code, data, message } = await Api.application.workReport.plan.getPlanId({
    sn: snCode.value.trim(),
  });
  if (code === 200) {
    return data;
  }
  throw new Error(message || '查询失败');
};

const fetchPlanDetail = async (planId) => {
  const [planRes, detailRes] = await Promise.all([
    Api.application.workReport.plan.getPlanDetail({ id: planId }),
    Api.application.workReport.wksr.planDetail({ planId }),
  ]);
  if (planRes.code === 200 && planRes.data) {
    Object.assign(planInfo, planRes.data || {});
  }
  if (detailRes.code === 200 && Array.isArray(detailRes.data)) {
    const grouped = [];
    detailRes.data.forEach((item) => {
      const target = grouped.find((route) => route.produceRouteId === item.produceRouteId);
      const child = {
        ...item,
        reportHour: item.reportHour ?? 0,
        reportQty: item.reportQty ?? 0,
      };
      if (!target) {
        grouped.push({
          produceRouteId: item.produceRouteId,
          produceRouteName: item.produceRouteName,
          isComplete: item.isComplete,
          children: [child],
        });
      } else {
        target.children.push(child);
      }
    });
    workRoutes.value = grouped;
  } else {
    workRoutes.value = [];
  }
};

const handleSearch = async () => {
  if (!snCode.value.trim()) {
    showFailToast('请输入需要查询的SN码');
    return;
  }
  activeTab.value = 'detail';
  resetData();
  const toast = showLoadingToast({ message: '加载中…', duration: 0, forbidClick: true });
  try {
    const planId = await fetchPlanId();
    if (!planId) {
      showFailToast('未找到相关专案');
      return;
    }
    await fetchPlanDetail(planId);
  } catch (error) {
    showFailToast(error?.message || '查询失败');
  } finally {
    toast.close();
  }
};

const openScan = () => {
  showScan.value = true;
  requestAnimationFrame(() => {
    scanCodeRef.value
      ?.open?.()
      ?.then((val) => {
        if (!val) return;
        snCode.value = val;
        handleSearch();
        showScan.value = false;
      })
      ?.catch(() => {
        showScan.value = false;
      });
  });
};

const handleScanConfirm = (value) => {
  if (!value) return;
  snCode.value = value;
  showScan.value = false;
  handleSearch();
};

const updateRouteComplete = ({ routeId, value }) => {
  const route = workRoutes.value.find((item) => item.produceRouteId === routeId);
  if (route) {
    route.isComplete = value ? 1 : 0;
  }
};

const findMaterial = (routeId, materialId) => {
  const route = workRoutes.value.find((item) => item.produceRouteId === routeId);
  if (!route) return null;
  return route.children?.find((child) => child.id === materialId) || null;
};

const updateReportHour = ({ routeId, materialId, value }) => {
  const target = findMaterial(routeId, materialId);
  if (target) {
    target.reportHour = Number(value) || 0;
  }
};

const updateReportQty = ({ routeId, materialId, value }) => {
  const target = findMaterial(routeId, materialId);
  if (target) {
    target.reportQty = Number(value) || 0;
  }
};

const hourToSecond = (hours, precision = 0) => {
  const value = Number(hours) || 0;
  const seconds = value * 3600;
  if (precision <= 0) return Math.round(seconds);
  const factor = 10 ** precision;
  return Math.round(seconds * factor) / factor;
};

const handleSubmit = async () => {
  if (!snCode.value.trim()) {
    showFailToast('请先查询SN码');
    return;
  }
  if (!hasRouteData.value) {
    showFailToast('无可提交数据');
    return;
  }
  const payload = workRoutes.value.flatMap((route) =>
    (route.children || []).map((child) => ({
      ...child,
      isComplete: route.isComplete,
      reportHour: hourToSecond(child.reportHour, 3),
    }))
  );
  if (!payload.length) {
    showFailToast('无可提交数据');
    return;
  }
  const toast = showLoadingToast({ message: '提交中…', duration: 0, forbidClick: true });
  try {
    const res = await Api.application.workReport.wksr.reportSave(payload);
    if (res.code === 200) {
      snCode.value = '';
      resetData();
      showSuccessToast('保存成功');
    } else {
      showFailToast(res.message || '提交失败');
    }
  } catch (error) {
    showFailToast(error?.message || '提交失败');
  } finally {
    toast.close();
  }
};

const handleJump = (billNumber) => {
  if (!billNumber) return;
  router.push({
    name: 'appsWorkReportMissingMaterial',
    query: { billNumber },
  });
};

const handleBack = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.work-report {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: calc(16px + var(--van-safe-area-bottom, 0px));

  &__content {
    padding: calc(72px + var(--van-safe-area-top, 0px)) 16px 80px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__search {
    display: flex;
    align-items: center;
    gap: 8px;

    :deep(.van-search) {
      flex: 1;
    }
  }

  &__button {
    height: 40px;
  }

  &__tabs {
    background: transparent;

    :deep(.van-tabs__wrap) {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }

    :deep(.van-tab__pane) {
      padding: 16px 0 0;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 16px calc(12px + var(--van-safe-area-bottom, 0px));
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.06);
  }
}
</style>
