export default {
  path: 'tasks',
  name: 'tasks',
  meta: { title: '任务', icon: 'todo-list-o', tabbar: true, requiresAuth: true },
  component: () => import('@/views/tasks/index.vue'),
}
