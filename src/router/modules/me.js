export default {
  path: 'me',
  name: 'me',
  meta: { title: 'routes.me', icon: 'user-o', tabbar: true, requiresAuth: true },
  component: () => import('@/views/account/Me.vue'),
}
