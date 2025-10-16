export default {
  path: 'apps',
  name: 'AppCenter',
  meta: { title: '应用', icon: 'todo-list-o', tabbar: true, requiresAuth: true },
  component: () => import('@/views/apps/index.vue'),
};
