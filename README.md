# BIP Mobile H5

一个基于 **Vue 3 · Vite · Vant 4** 的移动端管理后台，聚焦招聘、考勤等业务场景，内置账号中心、应用广场、招聘流程等页面模块，开箱即可二次开发。

## 特性概览

- ⚙️ **现代技术栈**：Vue 3 组合式 API、Vite 5、Pinia、Vue Router 4、Vue I18n、Vant 4、Day.js。
- 🌐 **国际化支持**：内置中/英双语，提供全局 `LanguageSelector` 组件，统一的 `changeLocale` 辅助方法以及语言持久化逻辑。
- 🧭 **全局组件**：`dc-nav-bar`、`LanguageSelector`、`Dict`、`RecruitForm`、`Uploader` 等常用能力一次注册全局复用。
- 🔐 **认证体系**：`store/user` 负责令牌、用户信息管理以及密码修改，配合权限指令与路由守卫实现细粒度控制。
- 📡 **网络层增强**：基于 Axios 的请求封装，支持刷新 Token、取消重复请求、失败重试、上传等高级能力。
- 🧰 **开发体验**：ESLint + Prettier + Vitest，内置常用工具函数、常量、组合式函数，提高业务迭代效率。

## 快速开始

```bash
npm install
npm run dev
```

访问 `http://localhost:5173` 即可预览。

## 常用脚本

| 指令              | 说明                     |
| ----------------- | ------------------------ |
| `npm run dev`     | 本地开发，支持热更新     |
| `npm run build`   | 构建生产包               |
| `npm run preview` | 预览构建产物             |
| `npm run lint`    | 使用 ESLint 检查代码质量 |
| `npm run test`    | 运行 Vitest 单元测试     |

## 目录结构

```
src
├── api/                # Axios 实例与接口封装
├── components/         # 全局组件，已通过 registerComponents 挂载
├── composables/        # 组合式函数（含 useScrollHide 等）
├── constants/          # 业务常量（如 keys、user-types）
├── layouts/            # 布局相关组件
├── locales/            # 语言包与 changeLocale 工具
├── router/             # 路由与导航守卫
├── store/              # Pinia 状态管理（user、permission 等）
├── styles/             # 全局样式与主题变量
├── utils/              # 工具函数与辅助类
└── views/              # 业务页面（Home、Apps、Recruit、Account 等）
```

## 国际化语言选择

- `src/components/LanguageSelector.vue` 提供固定文案的底部弹出选择器。
- `changeLocale` 会同步更新 `vue-i18n` 的语言与本地持久化。
- `LanguageSelector` 已在 `registerComponents` 中全局注册，可直接在任意页面模板中使用。

## 常量管理

- `src/constants/keys.js`：存放鉴权相关的本地存储键值。
- `src/constants/user-types.js`：统一维护业务端用户类型枚举，按需扩展。

## 测试与质量

- 使用 ESLint@9 + `eslint-plugin-vue` 约束代码风格。
- 使用 Vitest + Vue Test Utils 进行单元测试。
- 推荐在提交代码前执行 `npm run lint` 与 `npm run test`。

## 贡献指南

1. Fork & Clone 项目。
2. 新建分支进行开发，确保通过必要的检查。
3. 提交 Pull Request，并描述改动内容与测试情况。

欢迎反馈问题或提交改进建议，共同完善移动端业务脚手架。
