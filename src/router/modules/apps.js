export const appDetailRoutes = [
  {
    path: '/apps/flow-center',
    name: 'AppFlowCenter',
    meta: { title: '流程中心', requiresAuth: true },
    component: () => import('@/views/apps/pages/FlowCenter.vue'),
  },
  {
    path: '/apps/profit-tracking',
    name: 'AppProfitTracking',
    meta: { title: '利润跟进', requiresAuth: true },
    component: () => import('@/views/apps/pages/ProfitTracking.vue'),
  },
  {
    path: '/apps/inbound-order',
    name: 'AppInboundOrder',
    meta: { title: '入库单', requiresAuth: true },
    component: () => import('@/views/apps/pages/InboundOrder.vue'),
  },
  {
    path: '/apps/site-plan',
    name: 'AppSitePlan',
    meta: { title: '现场计划单', requiresAuth: true },
    component: () => import('@/views/apps/pages/SitePlan.vue'),
  },
  {
    path: '/apps/paperless-timesheet',
    name: 'AppPaperlessTimesheet',
    meta: { title: '工时无纸', requiresAuth: true },
    component: () => import('@/views/apps/pages/PaperlessTimesheet.vue'),
  },
  {
    path: '/apps/material-pickup-confirmation',
    name: 'AppMaterialPickupConfirmation',
    meta: { title: '确认领料', requiresAuth: true },
    component: () => import('@/views/apps/pages/MaterialPickupConfirmation.vue'),
  },
  {
    path: '/apps/material-info-maintenance',
    name: 'AppMaterialInfoMaintenance',
    meta: { title: '物料信息维护', requiresAuth: true },
    component: () => import('@/views/apps/pages/MaterialInfoMaintenance.vue'),
  },
  {
    path: '/apps/wire-outbound',
    name: 'AppWireOutbound',
    meta: { title: '线材出库', requiresAuth: true },
    component: () => import('@/views/apps/pages/WireOutbound.vue'),
  },
  {
    path: '/apps/shipment-doc-upload',
    name: 'AppShipmentDocUpload',
    meta: { title: '出货资料上传', requiresAuth: true },
    component: () => import('@/views/apps/pages/ShipmentDocUpload.vue'),
  },
  {
    path: '/apps/outsourcing-settlement',
    name: 'AppOutsourcingSettlement',
    meta: { title: '外协核算', requiresAuth: true },
    component: () => import('@/views/apps/pages/OutsourcingSettlement.vue'),
  },
  {
    path: '/apps/self-service-outbound',
    name: 'AppSelfServiceOutbound',
    meta: { title: '自助出库', requiresAuth: true },
    component: () => import('@/views/apps/pages/SelfServiceOutbound.vue'),
  },
  {
    path: '/apps/equipment-archive',
    name: 'AppEquipmentArchive',
    meta: { title: '设备档案', requiresAuth: true },
    component: () => import('@/views/apps/pages/EquipmentArchive.vue'),
  },
];

export default {
  path: 'apps',
  name: 'AppCenter',
  meta: { title: 'routes.apps', icon: 'todo-list-o', tabbar: true, requiresAuth: true },
  component: () => import('@/views/apps/index.vue'),
};
