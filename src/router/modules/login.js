// routes（或拆分的 routes-login.js）
export default {
  path: '/login',
  component: () => import('@/views/login/LoginLayout.vue'),
  redirect: (to) => ({ name: 'LOGIN_ACCOUNT', query: to.query }),
  children: [
    {
      path: 'account',
      name: 'LOGIN_ACCOUNT',
      component: () => import('@/views/login/account.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: 'social',
      name: 'LOGIN_SOCIAL',
      component: () => import('@/views/login/social.vue'),
      meta: { requiresAuth: false },
    },
  ],
};
