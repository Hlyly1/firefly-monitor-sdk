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

```typescript
import BrowserMonitor from '@firefly-monitor/browser';

const monitor = new BrowserMonitor({
  appId: 'your-app-id',
  url: 'https://api.example.com/monitor',
  enableError: true,
  enablePerformance: true,
  enableBehavior: true,
  sampling: 1.0
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
import App from './App.vue';

const app = createApp(App);

app.use(FireflyVuePlugin, {
  appId: 'your-app-id',
  url: 'https://api.example.com/monitor'
});

app.mount('#app');
```

### React

```tsx
import { MonitorErrorBoundary, BrowserMonitor } from '@firefly-monitor/react';

const monitor = new BrowserMonitor({
  appId: 'your-app-id',
  url: 'https://api.example.com/monitor'
});

function App() {
  return (
    <MonitorErrorBoundary monitor={monitor}>
      <YourApp />
    </MonitorErrorBoundary>
  );
}
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
