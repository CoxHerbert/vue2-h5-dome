// src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from '@/router';

// 样式
import 'nprogress/nprogress.css';
import 'vant/lib/index.css';
import '@/styles/index.scss';

// 插件 & 工具
import './plugins/index';
import vant from 'vant';
import { registerComponents } from './components/index';
import { setupDirectives } from './directives';
import { setupPlugins } from '@/plugins';
import { attachNProgress } from '@/router/nprogress';

// —— 启动函数（推荐异步引导）——
async function bootstrap() {
  const app = createApp(App);

  // 1) 状态 & 路由
  const pinia = createPinia();
  app.use(pinia);
  app.use(vant);
  app.use(router);

  // 2) 全局注册（组件/指令/插件）
  registerComponents(app);
  setupDirectives(app);
  attachNProgress(router);
  await setupPlugins(app); // 若你的 plugins 里有异步初始化

  // 3) 权限守卫（放在 router、pinia 注册之后）
  //    注意：若 permission.js 内部会使用 pinia，请确保它在 app.use(pinia) 之后执行
  await import('./permission.js');

  // 4) 启动前兜底：如果已登录但本地没有用户资料，则拉一次用户信息
  const { useAuthStore } = await import('@/store/auth');
  const { useUserStore } = await import('@/store/user');
  const auth = useAuthStore();
  const user = useUserStore();
  if (auth.isLogin && !user.userInfo) {
    try {
      await user.fetchUserInfo();
    } catch {
      // 忽略启动期拉取失败，交由页面或拦截器兜底
    }
  }

  // 5) 等路由就绪再挂载，避免首屏空白或闪烁
  await router.isReady();
  app.mount('#app');
}

bootstrap();
