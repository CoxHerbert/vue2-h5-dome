/**
 * 此文件由 scripts/generate-workflow-routes.js 自动生成。
 *
 * 运行 `node scripts/generate-workflow-routes.js` 以重新生成。
 */
import type { RouteRecordRaw } from 'vue-router';

export const workflowRoutes: RouteRecordRaw[] = [
  {
    path: '/workflow/workbench',
    name: 'WorkflowWorkbench',
    component: () => import('../pages/workbench/index.vue'),
    meta: {
      navigationBarTitleText: "工作台",
      enablePullDownRefresh: true,
      navigationStyle: "custom"
    }
  },
  {
    path: '/workflow/create',
    name: 'WorkflowCreate',
    component: () => import('../pages/create/index.vue'),
    meta: {
      navigationBarTitleText: "新建流程",
      enablePullDownRefresh: true,
      navigationStyle: "custom"
    }
  },
  {
    path: '/workflow/mine',
    name: 'WorkflowMine',
    component: () => import('../pages/mine/index.vue'),
    meta: {
      navigationBarTitleText: "我的事务",
      enablePullDownRefresh: true,
      navigationStyle: "custom"
    }
  },
  {
    path: '/workflow/form/start',
    name: 'WorkflowFormStart',
    component: () => import('../pages/form/start.vue'),
    meta: {
      navigationBarTitleText: "发起流程",
      enablePullDownRefresh: false
    }
  },
  {
    path: '/workflow/warehouse',
    name: 'WorkflowWarehouse',
    component: () => import('../pages/warehouse/index.vue'),
    meta: {
      navigationBarTitleText: "仓库",
      enablePullDownRefresh: false
    }
  },
  {
    path: '/workflow/form/detail',
    name: 'WorkflowFormDetail',
    component: () => import('../pages/form/detail.vue'),
    meta: {
      navigationBarTitleText: "流程详情",
      enablePullDownRefresh: false
    }
  },
  {
    path: '/workflow/external/Leave/start',
    name: 'WorkflowExternalLeaveStart',
    component: () => import('../pages/external/Leave/start.vue'),
    meta: {
      navigationBarTitleText: "发起流程",
      enablePullDownRefresh: false
    }
  },
  {
    path: '/workflow/external/Leave/detail',
    name: 'WorkflowExternalLeaveDetail',
    component: () => import('../pages/external/Leave/detail.vue'),
    meta: {
      navigationBarTitleText: "流程详情",
      enablePullDownRefresh: false
    }
  }
];

export default workflowRoutes;
