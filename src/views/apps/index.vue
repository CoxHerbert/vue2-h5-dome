<template>
  <div class="page apps">
    <dc-nav-bar :title="t('routes.apps')" fixed />
    <div class="apps__content">
      <van-grid class="apps__grid" :column-num="4" :gutter="12" clickable :border="false">
        <van-grid-item v-for="app in apps" :key="app.routeName" :to="{ name: app.routeName }">
          <template #icon>
            <img :src="app.icon" :alt="app.label" class="apps__icon" loading="lazy" />
          </template>
          <template #text>
            <span class="apps__label">{{ app.label }}</span>
          </template>
        </van-grid-item>
      </van-grid>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const apps = [
  { label: '流程中心', icon: '/images/apps/流程中心.svg', routeName: 'appsWorkflowCenter' },
  { label: '料况跟进', icon: '/images/apps/料况跟进.svg', routeName: 'appsMaterialTracking' },
  { label: '入库单', icon: '/images/apps/入库单.svg', routeName: 'appsInboundOrder' },
  { label: '现场计划单', icon: '/images/apps/现场计划单.svg', routeName: 'appsSitePlanning' },
  { label: '工时汇报', icon: '/images/apps/工时汇报.svg', routeName: 'appsWorkReport' },
  { label: '确认领料', icon: '/images/apps/确认领料.svg', routeName: 'appsPickingConfirmation' },
  {
    label: '物料信息维护',
    icon: '/images/apps/物料信息维护.svg',
    routeName: 'appsMaterialMaintenance',
  },
  { label: '线材质检', icon: '/images/apps/线材质检.svg', routeName: 'appsWireInspection' },
  { label: '出货资料上传', icon: '/images/apps/出货资料上传.svg', routeName: 'appsShipmentUpload' },
  { label: '外协核价', icon: '/images/apps/外协核价.svg', routeName: 'appsOutsourcingQuotation' },
  { label: '自助出库', icon: '/images/apps/自助出库.svg', routeName: 'appsSelfOutbound' },
  { label: '铭牌绑定', icon: '/images/apps/名牌绑定.svg', routeName: 'appsNameplateBinding' },
];
</script>

<style lang="scss" scoped>
.apps {
  min-height: 100vh;
  background: #f7f8fa;
}

.apps__content {
  padding: 24px 16px;
  padding-top: calc(72px + var(--van-safe-area-top, 0px));
  box-sizing: border-box;
}
:deep(.van-grid-item) {
  padding: 0;
}
:deep(.van-grid-item__content) {
  padding: 0;
}
.apps__grid {
  background: #ffffff;
  border-radius: 16px;
  padding: 12px 0;
}

.apps__icon {
  width: 48px;
  height: 48px;
}

.apps__label {
  display: inline-block;
  margin-top: 8px;
  color: #323233;
  font-size: 14px;
}
</style>
