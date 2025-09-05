export default {
  path: 'home',
  name: 'home',
  meta: { title: '首页', icon: 'home-o', tabbar: true, requiresAuth: true },
  component: () => import('@/views/home/index.vue'),
}
