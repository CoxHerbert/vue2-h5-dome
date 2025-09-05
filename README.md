# Vue 3 + Vite + Vant 4 企业级脚手架（JavaScript）

> 生成时间：2025-09-02 06:44:14

本脚手架以**纯 JS**为准，内置：Vant4、Pinia、Vue Router4、Axios 网络层（重试/幂等/去重/取消/刷新 Token/节流防抖/上传）、权限指令、NProgress、Vitest。

## 快速开始

```bash
npm i
npm run dev
```

## 目录概览

- `src/main.js` 入口，注册 `Vant/Pinia/Router`、指令、NProgress
- `src/router/` 路由与守卫（白名单、登录跳转、标题）
- `src/store/` Pinia（auth）
- `src/api/` Axios 实例与接口封装
- `src/utils/` 工具（TaskPool、rate-limit、auth、net-key、upload）
- `src/directives/` 自定义指令（v-perm、v-anti-click）
- `src/components/` 通用组件（AppUploader）
- `src/views/` 页面（Login、Home、Protected）
- `tests/` Vitest 示例

## 环境变量

- `VITE_APP_BASE_URL`：业务 API 根路径（被 `/api` 代理）

## 测试

```bash
npm test
```

// 用法：
// main.js
import createDictClient from '@/plugins/dict-client'
const dict = createDictClient({ ttl: 3600_000 }) // 默认使用 Api.dcit.getDict
app.use(dict)

// 任意组件
const dict = inject('dict')
const items = await dict.get('DC_FORWARD_STATUS') // 扁平数据
const tree = await dict.getTree('DC_FORWARD_STATUS') // 树数据 {label,value,children}

// =========================
// 新增文件：src/stores/dictTrees.js（仅树状、仅内存缓存、支持多 code 一次获取）
// 需求：
// - 仅需要树结构 { label, value, children }
// - 不使用本地存储（仅内存缓存，组件多次调用不重复请求）
// - 组件中可：const dicts = await getTrees(['DC_FORWARD_STATUS','DC_FORWARD_STATUS'])
// dicts.DC_FORWARD_STATUS 直接拿到对应字典树
// - 请求接口固定：Api.dcit.getDict({ code, ...params })
// =========================
