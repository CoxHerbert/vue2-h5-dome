import { ensureAuthRouteGuard } from '@/router/ensure-auth';

export default {
  path: '/recruit',
  name: 'recruit',
  children: [
    {
      path: 'campus',
      name: 'recruit-campus',
      children: [
        {
          path: 'list', // 校招岗位列表
          name: 'recruit-campus-list',
          meta: { title: 'routes.recruit.campusList', requiresAuth: true },
          component: () => import('@/views/recruit/campus/list.vue'),
        },
        {
          path: 'apply', // 校招投递表单
          name: 'recruit-campus-apply',
          meta: { title: 'routes.recruit.campusApply', requiresAuth: false },
          beforeEnter: ensureAuthRouteGuard({ type: 'campus_applicant', mode: 'social' }),
          component: () => import('@/views/recruit/campus/apply.vue'),
        },
        // ===== 新增：投递详情（评审状态） =====
        {
          path: 'apply-detail/:applyId?', // 可带投递ID；没有ID也可通过query传status
          name: 'recruit-campus-apply-detail',
          meta: { title: 'routes.recruit.campusApplyDetail', requiresAuth: false },
          component: () => import('@/views/recruit/campus/apply-detail.vue'),
        },
      ],
    },
  ],
};
