# Firefly Monitor SDK

> 轻量级、高性能的前端监控 SDK（Monorepo 架构）

[![license](https://img.shields.io/npm/l/firefly-monitor-sdk.svg)](LICENSE)

## ✨ 特性

- 🚀 轻量级，压缩后体积小
- 📊 完整的监控维度：错误、性能、行为
- 🔌 插件化架构，易于扩展
- 💪 完善的 TypeScript 类型支持
- 📦 支持多种模块格式（ESM、CJS、UMD）
- 🎯 Monorepo 架构，按需引入
- 🔧 支持 Vue/React 框架集成

## 📦 包列表

| 包名 | 版本 | 说明 |
|------|------|------|
| [@firefly-monitor/shared](./packages/shared) | 0.1.0 | 共享工具和类型 |
| [@firefly-monitor/core](./packages/core) | 0.1.0 | 核心监控功能 |
| [@firefly-monitor/browser](./packages/browser) | 0.1.0 | 浏览器端集成 |
| [@firefly-monitor/vue](./packages/vue) | 0.1.0 | Vue 插件 |
| [@firefly-monitor/react](./packages/react) | 0.1.0 | React 组件 |

## 📦 安装

### 浏览器端（推荐）

```bash
npm install @firefly-monitor/browser
```

### Vue 项目

```bash
npm install @firefly-monitor/vue
```

### React 项目

```bash
npm install @firefly-monitor/react
```

## 🚀 快速开始

### 浏览器端

#### 方式一：使用 init 函数（推荐）

```typescript
import { init, Errors, Metrics } from '@firefly-monitor/browser'

const monitoring = init({
  dsn: 'http://localhost:8080/api/v1/monitoring/reactqL9vG',
  integrations: [new Errors(), new Metrics()],
})
```

#### 方式二：使用 BrowserMonitor 类

```typescript
import BrowserMonitor, { Errors, Metrics, Behavior } from '@firefly-monitor/browser';

const monitor = new BrowserMonitor({
  dsn: 'http://localhost:8080/api/v1/monitoring/reactqL9vG',
  integrations: [
    new Errors(),
    new Metrics(),
    new Behavior()
  ],
  sampling: 1.0,
  debug: false
});

monitor.track('custom_event', {
  action: 'button_click',
  label: 'purchase_button'
});
```

### Vue 3

```typescript
import { createApp } from 'vue';
import { FireflyVuePlugin } from '@firefly-monitor/vue';
import { Errors, Metrics } from '@firefly-monitor/browser';
import App from './App.vue';

const app = createApp(App);

app.use(FireflyVuePlugin, {
  dsn: 'http://localhost:8080/api/v1/monitoring/vueApp123',
  integrations: [new Errors(), new Metrics()]
});

app.mount('#app');
```

### React

```tsx
import { MonitorErrorBoundary } from '@firefly-monitor/react';
import { init, Errors, Metrics } from '@firefly-monitor/browser';

const monitor = init({
  dsn: 'http://localhost:8080/api/v1/monitoring/reactApp456',
  integrations: [new Errors(), new Metrics()]
});

function App() {
  return (
    <MonitorErrorBoundary monitor={monitor}>
      <YourApp />
    </MonitorErrorBoundary>
  );
}
```

## 🔌 集成插件

Firefly Monitor SDK 采用插件化架构，提供以下内置集成插件：

### Errors - 错误监控

自动捕获和上报各类错误：

- ✅ JavaScript 运行时错误
- ✅ Promise 拒绝错误
- ✅ 资源加载错误
- ✅ 网络请求错误（xhr/fetch）

```typescript
import { init, Errors } from '@firefly-monitor/browser';

const monitor = init({
  dsn: 'your-dsn',
  integrations: [new Errors()]
});
```

### Metrics - 性能监控

自动收集和上报性能指标：

- ✅ Web Vitals 核心指标（CLS、FID、LCP、FCP、TTFB）
- ✅ 页面导航时序（DNS、TCP、请求、响应等）
- ✅ 资源加载时序（图片、脚本、样式等）

```typescript
import { init, Metrics } from '@firefly-monitor/browser';

const monitor = init({
  dsn: 'your-dsn',
  integrations: [new Metrics()]
});
```

### Behavior - 用户行为监控

自动跟踪和上报用户行为：

- ✅ 点击事件
- ✅ 页面滚动
- ✅ 页面可见性变化
- ✅ 路由变化（支持 hash 和 history 模式）
- ✅ 页面生命周期（pageshow/pagehide）

```typescript
import { init, Behavior } from '@firefly-monitor/browser';

const monitor = init({
  dsn: 'your-dsn',
  integrations: [new Behavior()]
});
```

### 自定义集成

你也可以创建自定义集成插件：

```typescript
import { Integration, EventCallback } from '@firefly-monitor/browser';

class CustomIntegration implements Integration {
  name = 'CustomIntegration';

  setupOnce(
    addCallback: (callback: EventCallback) => void,
    getCurrentMonitor: () => unknown
  ): void {
    const monitor = getCurrentMonitor();
    // 实现你的监控逻辑
  }
}

const monitor = init({
  dsn: 'your-dsn',
  integrations: [new CustomIntegration()]
});
```

## 📚 文档

详细文档请访问：[待补充]

## 🏗️ Monorepo 架构

本项目采用 monorepo 架构，详细说明请查看 [MONOREPO.md](./MONOREPO.md)

## 🛠️ 开发

```bash
# 安装依赖（推荐使用 pnpm）
pnpm install

# 开发模式（所有包）
pnpm dev

# 构建所有包
pnpm build

# 构建特定包
pnpm build:core
pnpm build:browser

# 运行测试
pnpm test

# 代码检查
pnpm lint

# 格式化代码
pnpm format

# 清理
pnpm clean
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

在提交 PR 之前，请确保：

1. 代码通过 lint 检查
2. 添加了必要的测试
3. 更新了相关文档
4. 遵循 commit 规范

## 📄 许可证

[MIT](LICENSE)
