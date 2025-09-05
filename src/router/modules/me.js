export default {
  path: 'me',
  name: 'me',
  meta: { title: '我的', icon: 'user-o', tabbar: true, requiresAuth: true },
  component: () => import('@/views/account/Me.vue'),
}
