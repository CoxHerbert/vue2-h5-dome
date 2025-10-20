export default {
  path: 'apps',
  component: () => import('@/views/apps/Layout.vue'),
  children: [
    {
      path: '',
      name: 'apps',
      meta: { title: 'routes.apps', icon: 'todo-list-o', tabbar: true, requiresAuth: true },
      component: () => import('@/views/apps/index.vue'),
    },
    {
      path: 'workflow-center',
      name: 'appsWorkflowCenter',
      meta: { title: '流程中心', requiresAuth: true },
      component: () => import('@/views/apps/WorkflowCenter.vue'),
    },
    {
      path: 'material-tracking',
      name: 'appsMaterialTracking',
      meta: { title: '料况跟进', requiresAuth: true },
      component: () => import('@/views/apps/MaterialTracking.vue'),
    },
    {
      path: 'inbound-order',
      component: () => import('@/views/apps/InboundOrder/index.vue'),
      children: [
        {
          path: '',
          name: 'appsInboundOrder',
          meta: { title: '入库单', requiresAuth: true },
          component: () => import('@/views/apps/InboundOrder/List.vue'),
        },
        {
          path: 'create',
          name: 'appsInboundOrderCreate',
          meta: { title: '新增入库单', requiresAuth: true },
          component: () => import('@/views/apps/InboundOrder/Create.vue'),
        },
        {
          path: ':id',
          name: 'appsInboundOrderDetail',
          meta: { title: '入库单详情', requiresAuth: true },
          component: () => import('@/views/apps/InboundOrder/Detail.vue'),
        },
      ],
    },
    {
      path: 'site-planning',
      name: 'appsSitePlanning',
      meta: { title: '现场计划单', requiresAuth: true },
      component: () => import('@/views/apps/SitePlanning.vue'),
    },
    {
      path: 'work-report',
      name: 'appsWorkReport',
      meta: { title: '工时汇报', requiresAuth: true },
      component: () => import('@/views/apps/WorkReport.vue'),
    },
    {
      path: 'picking-confirmation',
      name: 'appsPickingConfirmation',
      meta: { title: '确认领料', requiresAuth: true },
      component: () => import('@/views/apps/PickingConfirmation.vue'),
    },
    {
      path: 'material-maintenance',
      name: 'appsMaterialMaintenance',
      meta: { title: '物料信息维护', requiresAuth: true },
      component: () => import('@/views/apps/MaterialMaintenance/index.vue'),
    },
    {
      path: 'wire-inspection',
      name: 'appsWireInspection',
      meta: { title: '线材质检', requiresAuth: true },
      component: () => import('@/views/apps/WireInspection.vue'),
    },
    {
      path: 'shipment-upload',
      name: 'appsShipmentUpload',
      meta: { title: '出货资料上传', requiresAuth: true },
      component: () => import('@/views/apps/ShipmentUpload.vue'),
    },
    {
      path: 'outsourcing-quotation',
      name: 'appsOutsourcingQuotation',
      meta: { title: '外协核价', requiresAuth: true },
      component: () => import('@/views/apps/OutsourcingQuotation.vue'),
    },
    {
      path: 'self-outbound',
      name: 'appsSelfOutbound',
      meta: { title: '自助出库', requiresAuth: true },
      component: () => import('@/views/apps/SelfOutbound.vue'),
    },
    {
      path: 'nameplate-binding',
      name: 'appsNameplateBinding',
      meta: { title: '铭牌绑定', requiresAuth: true },
      component: () => import('@/views/apps/NameplateBinding.vue'),
    },
  ],
};
