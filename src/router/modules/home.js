export default {
  path: 'home',
  name: 'home',
  meta: { title: 'routes.home', icon: 'home-o', tabbar: true, requiresAuth: true },
  component: () => import('@/views/home/index.vue'),
}
