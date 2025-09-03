# Vue 3 + Vite + Vant 4 企业级脚手架（JavaScript）

> 生成时间：2025-09-02 06:44:14

本脚手架以**纯 JS**为准，内置：Vant4、Pinia、Vue Router4、Axios 网络层（重试/幂等/去重/取消/刷新 Token/节流防抖/上传）、权限指令、NProgress、Vitest、Husky+lint-staged。

## 快速开始

```bash
npm i
npm run dev
```

## 目录概览

- `src/main.js` 入口，注册 `Vant/Pinia/Router`、指令、NProgress
- `src/router/` 路由与守卫（白名单、登录跳转、标题）
- `src/store/` Pinia（auth）
- `src/apis/` Axios 实例与接口封装
- `src/utils/` 工具（TaskPool、rate-limit、auth、net-key、upload）
- `src/directives/` 自定义指令（v-perm、v-anti-click）
- `src/components/` 通用组件（AppUploader）
- `src/pages/` 页面（Login、Home、Protected）
- `tests/` Vitest 示例

## 环境变量

- `VITE_APP_API`：业务 API 根路径（被 `/api` 代理）
- `VITE_UPLOAD_API`：上传域名（被 `/upload` 代理）

## 测试

```bash
npm test
```
