export default {
  path: 'apps',
  name: 'AppCenter',
  meta: { title: 'routes.apps', icon: 'todo-list-o', tabbar: true, requiresAuth: true },
  component: () => import('@/views/apps/index.vue'),
};
