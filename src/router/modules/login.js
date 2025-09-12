// src/router/modules/login.js
import ROUTE_NAME from '@/router/route-names';

const LoginLayout = () => import('@/views/login/LoginLayout.vue');
const LoginAccount = () => import('@/views/login/AccountLogin.vue');
const LoginPhone = () => import('@/views/login/PhoneLogin.vue');
const LoginWeChat = () => import('@/views/login/WeChatLogin.vue');
const LoginWeCom = () => import('@/views/login/WeComLogin.vue');
const WeChatCallback = () => import('@/views/login/WeChatCallback.vue');
const WeComCallback = () => import('@/views/login/WeComCallback.vue');
const LoginSocial = () => import('@/views/login/Social.vue');

export default {
  path: '/login',
  name: ROUTE_NAME.LOGIN,
  component: LoginLayout,
  meta: { public: true, layout: 'blank', title: '登录' },
  redirect: { name: ROUTE_NAME.LOGIN_ACCOUNT },
  children: [
    // {
    //   path: 'social',
    //   name: ROUTE_NAME.LOGIN_ACCOUNT,
    //   component: LoginSocial,
    //   meta: { public: true, title: '授权登录' },
    // },
    {
      path: 'account',
      name: ROUTE_NAME.LOGIN_ACCOUNT,
      component: LoginAccount,
      meta: { public: true, title: '账号登录' },
    },
    {
      path: 'phone',
      name: ROUTE_NAME.LOGIN_PHONE,
      component: LoginPhone,
      meta: { public: true, title: '手机号登录' },
    },
    {
      path: 'wechat',
      name: ROUTE_NAME.LOGIN_WECHAT,
      component: LoginWeChat,
      meta: { public: true, title: '微信登录', sso: 'wechat' },
    },
    {
      path: 'wecom',
      name: ROUTE_NAME.LOGIN_WECOM,
      component: LoginWeCom,
      meta: { public: true, title: '企业微信登录', sso: 'wecom' },
    },
    {
      path: 'wechat/callback',
      name: ROUTE_NAME.LOGIN_WECHAT_CB,
      component: WeChatCallback,
      meta: { public: true, title: '微信登录回调' },
    },
    {
      path: 'wecom/callback',
      name: ROUTE_NAME.LOGIN_WECOM_CB,
      component: WeComCallback,
      meta: { public: true, title: '企业微信回调' },
    },
  ],
};
