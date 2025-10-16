<template>
  <div class="page">
    <ScrollAwareNavBar title="应用" fixed />
    <section class="app-list">
      <RouterLink v-for="app in apps" :key="app.name" class="app-card" :to="app.route">
        <img :src="app.icon" :alt="app.name" class="app-card__icon" />
        <span class="app-card__name">{{ app.name }}</span>
      </RouterLink>
    </section>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';

const apps = [
  { name: '流程中心', icon: '/images/apps/flow-center.svg', route: { name: 'AppFlowCenter' } },
  { name: '利润跟进', icon: '/images/apps/profit-tracking.svg', route: { name: 'AppProfitTracking' } },
  { name: '入库单', icon: '/images/apps/inbound-order.svg', route: { name: 'AppInboundOrder' } },
  { name: '现场计划单', icon: '/images/apps/site-plan.svg', route: { name: 'AppSitePlan' } },
  { name: '工时无纸', icon: '/images/apps/paperless-timesheet.svg', route: { name: 'AppPaperlessTimesheet' } },
  { name: '确认领料', icon: '/images/apps/material-pickup-confirmation.svg', route: { name: 'AppMaterialPickupConfirmation' } },
  { name: '物料信息维护', icon: '/images/apps/material-info-maintenance.svg', route: { name: 'AppMaterialInfoMaintenance' } },
  { name: '线材出库', icon: '/images/apps/wire-outbound.svg', route: { name: 'AppWireOutbound' } },
  { name: '出货资料上传', icon: '/images/apps/shipment-doc-upload.svg', route: { name: 'AppShipmentDocUpload' } },
  { name: '外协核算', icon: '/images/apps/outsourcing-settlement.svg', route: { name: 'AppOutsourcingSettlement' } },
  { name: '自助出库', icon: '/images/apps/self-service-outbound.svg', route: { name: 'AppSelfServiceOutbound' } },
  { name: '设备档案', icon: '/images/apps/equipment-archive.svg', route: { name: 'AppEquipmentArchive' } },
];
</script>

<style lang="scss" scoped>
.page {
  min-height: 100%;
  padding: 56px 16px 24px;
  box-sizing: border-box;
  background: #f7f8fa;
}

.app-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px 12px;
}

.app-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  text-decoration: none;
  color: inherit;
  background: #fff;
  border-radius: 16px;
  padding: 12px 8px;
  box-shadow: 0 6px 12px rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.app-card:active {
  transform: scale(0.97);
  box-shadow: 0 4px 8px rgba(15, 23, 42, 0.08);
}

.app-card__icon {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
}

.app-card__name {
  font-size: 13px;
  line-height: 1.3;
  color: #1f2937;
}
</style>
