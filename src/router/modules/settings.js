export default {
  path: '/settings/debug',
  name: 'debugSettings',
  component: () => import('@/views/settings/DebugSettings.vue'),
  meta: {
    title: 'routes.debugSettings',
    titleFallback: '调试设置',
    requiresAuth: false,
  },
};
