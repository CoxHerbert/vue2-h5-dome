<template>
  <div class="work-report page">
    <dc-nav-bar title="工时汇报" fixed left-arrow @click-left="handleBack" />

    <div class="work-report__content">
      <!-- 普通白卡：搜索 + 扫码（不吸顶） -->
      <div class="work-report__search-card">
        <div class="search-row">
          <van-search
            v-model="snCode"
            placeholder="请输入SN码查询"
            shape="round"
            background="transparent"
            :show-action="false"
            @search="handleSearch"
          />
          <div class="btns">
            <van-button class="search-btn" round type="primary" size="small" @click="handleSearch">
              搜索
            </van-button>
            <van-button
              class="scan-btn"
              round
              size="small"
              plain
              type="primary"
              icon="scan"
              @click="openScan"
            />
          </div>
        </div>
      </div>

      <!-- Tabs：不吸顶 -->
      <van-tabs
        v-model:active="activeTab"
        class="work-report__tabs work-report__tabs--card"
        swipeable
        color="#3060ED"
        title-active-color="#3060ED"
        :line-height="2"
      >
        <van-tab title="专案详情" name="detail">
          <ProjectOverview :plan-info="planInfo" :color-enum="colorEnum" @jump="handleJump" />
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
    <van-back-top />
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

// 颜色枚举
const colorEnum = {
  延期: '#e12137',
  完成: 'green',
  进行中: '#1d65f3',
};

const hasRouteData = computed(() =>
  workRoutes.value.some((route) => (route.children || []).length)
);

// 数据重置
const resetData = () => {
  Object.keys(planInfo).forEach((key) => delete planInfo[key]);
  workRoutes.value = [];
};

// 接口
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

// 事件
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
  --nav-h: 62px; /* 与导航高度对齐 */
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: calc(16px + var(--van-safe-area-bottom, 0px));

  &__content {
    /* 仍然为固定导航预留顶部空间；底部统一留 80px 防止被提交栏挡住 */
    padding: calc(var(--nav-h) + var(--van-safe-area-top, 0px)) 16px 80px;
    box-sizing: border-box;
  }

  /* 普通白卡：搜索 + 扫码（不吸顶） */
  .work-report__search-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    padding: 12px;
    /* 去掉吸顶相关属性 */
    /* top / z-index / position: sticky 均不需要 */

    .search-row {
      display: flex;
      align-items: center;
      gap: 8px;

      :deep(.van-search) {
        flex: 1;
        padding: 0; /* 去掉 van-search 外层默认内边距 */
      }
      :deep(.van-search__content) {
        background: #f3f5f7;
        border-radius: 999px;
        height: 36px;
        min-height: 36px;
      }

      .btns {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .search-btn {
        height: 36px;
        padding: 0 14px;
        border-radius: 18px;
        :deep(.van-button__text) {
          font-size: 14px;
        }
        &.van-button--primary {
          background: #3060ed;
          border-color: #3060ed;
        }
      }

      .scan-btn {
        width: 36px;
        height: 36px;
        padding: 0;
        border-radius: 50%;
        &.van-button--plain {
          color: #3060ed;
          border-color: #3060ed;
          background: transparent;
        }
        :deep(.van-icon) {
          font-size: 18px;
        }
      }
    }
  }

  /* Tabs 导航样式（视觉保持“连体”风格，但不吸顶） */
  .work-report__tabs.work-report__tabs--card {
    margin-top: 12px;

    :deep(.van-tabs__wrap) {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      border-top: 1px solid #f0f2f5;
      /* 去掉 z-index 叠加需求 */
    }

    :deep(.van-tab) {
      font-size: 14px;
    }
    :deep(.van-tabs__line) {
      height: 2px;
      background: #3060ed;
    }
    :deep(.van-tab__pane) {
      padding: 16px 0 0;
      background: transparent;
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
