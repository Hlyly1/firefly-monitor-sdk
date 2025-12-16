# Firefly Monitor SDK 文档

欢迎使用 Firefly Monitor SDK - 轻量级、高性能的前端监控解决方案！

## 快速导航

### 指南
- [使用指南](./guide/usage.md) - 详细的使用说明和最佳实践
- [框架集成](./guide/integration.md) - React、Vue、Next.js 等框架集成指南

### API 文档
- [Browser API](./api/browser.md) - 浏览器端 API 完整文档

## ✨ 特性

- 🚀 **轻量级、高性能** - 压缩后体积小，对页面性能影响极小
- 📊 **完整的监控维度** - 错误监控、性能监控、用户行为跟踪
- 🔌 **插件化架构** - 灵活的插件系统，按需加载
- 💪 **TypeScript 支持** - 完整的类型定义
- 📦 **多框架支持** - React、Vue、Next.js、Nuxt.js 等
- 🎯 **采样控制** - 灵活的采样率配置
- 🔧 **自定义扩展** - 支持自定义集成插件

## 📦 安装

### 浏览器端（推荐）

```bash
npm install @firefly-monitor/browser
# 或
pnpm add @firefly-monitor/browser
# 或
yarn add @firefly-monitor/browser
```

### 框架集成

```bash
# Vue
npm install @firefly-monitor/vue

# React
npm install @firefly-monitor/react
```

## 🚀 快速开始

### 基础用法

```typescript
import { init, Errors, Metrics } from '@firefly-monitor/browser'

// 初始化监控
const monitoring = init({
  dsn: 'http://localhost:8080/api/v1/monitoring/reactqL9vG',
  integrations: [new Errors(), new Metrics()],
})
```

### 完整示例

```typescript
import { init, Errors, Metrics, Behavior } from '@firefly-monitor/browser'

const monitoring = init({
  dsn: 'http://localhost:8080/api/v1/monitoring/yourApp',
  
  // 配置采样率（可选）
  sampling: 1.0,
  
  // 配置上报参数（可选）
  maxQueueSize: 10,
  flushInterval: 5000,
  
  // 开启调试模式（可选）
  debug: process.env.NODE_ENV === 'development',
  
  // 配置集成插件
  integrations: [
    new Errors(),      // 错误监控
    new Metrics(),     // 性能监控
    new Behavior()     // 用户行为跟踪
  ],
})

// 手动上报自定义事件
monitoring.track('custom_event', {
  action: 'button_click',
  label: 'purchase'
})
```

## 🔌 集成插件

### Errors - 错误监控

自动捕获：
- ✅ JavaScript 运行时错误
- ✅ Promise 拒绝错误
- ✅ 资源加载错误

### Metrics - 性能监控

自动收集：
- ✅ Web Vitals 核心指标（CLS、FID、LCP、FCP、TTFB）
- ✅ 页面导航时序
- ✅ 资源加载性能

### Behavior - 用户行为

自动跟踪：
- ✅ 用户点击
- ✅ 页面滚动
- ✅ 路由变化
- ✅ 页面可见性

## 📚 更多文档

- [详细使用指南](./guide/usage.md)
- [框架集成指南](./guide/integration.md)
- [API 文档](./api/browser.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
