# Monorepo 架构说明

本项目采用 monorepo 架构，使用 pnpm workspace 管理多个子包。

## 📦 包结构

```
packages/
├── shared/          # 共享工具和类型定义
├── core/            # 核心监控功能
├── browser/         # 浏览器端集成
├── vue/             # Vue 插件
└── react/           # React 组件
```

## 🔗 包依赖关系

```
shared (基础包)
  ↓
core (依赖 shared)
  ↓
browser (依赖 core, shared)
  ↓
vue/react (依赖 browser, core, shared)
```

## 📋 包说明

### @firefly-monitor/shared

提供共享的类型定义和工具函数，所有其他包都依赖此包。

**主要内容：**
- TypeScript 类型定义
- 工具函数（debounce, throttle, generateSessionId 等）
- 常量定义

### @firefly-monitor/core

核心监控功能，提供基础的监控类和插件系统。

**主要功能：**
- Monitor 基类
- 插件系统
- 配置管理
- 数据上报基础

### @firefly-monitor/browser

浏览器端监控实现，扩展 core 包功能。

**主要功能：**
- 错误监控（JS错误、Promise错误、资源错误）
- 性能监控（Web Vitals）
- 行为追踪（点击、路由等）
- 数据上报

### @firefly-monitor/vue

Vue 框架集成插件。

**主要功能：**
- Vue 插件安装
- Vue 错误捕获
- Vue 全局实例注入

**使用示例：**
```typescript
import { FireflyVuePlugin } from '@firefly-monitor/vue';

app.use(FireflyVuePlugin, {
  appId: 'your-app-id',
  url: 'https://api.example.com/monitor'
});
```

### @firefly-monitor/react

React 框架集成组件。

**主要功能：**
- ErrorBoundary 组件
- React 错误捕获
- Hooks 支持（计划中）

**使用示例：**
```tsx
import { MonitorErrorBoundary, BrowserMonitor } from '@firefly-monitor/react';

const monitor = new BrowserMonitor({ appId: 'app', url: 'https://...' });

<MonitorErrorBoundary monitor={monitor}>
  <App />
</MonitorErrorBoundary>
```

## 🛠️ 开发命令

### 安装依赖

```bash
pnpm install
```

### 构建所有包

```bash
pnpm build
```

### 构建特定包

```bash
pnpm build:core
pnpm build:browser
```

### 开发模式

```bash
# 所有包
pnpm dev

# 特定包
cd packages/core
pnpm dev
```

### 测试

```bash
pnpm test
```

### 清理

```bash
pnpm clean
```

## 📝 添加新包

1. 在 `packages/` 目录下创建新包目录
2. 创建 `package.json`，name 格式为 `@firefly-monitor/[package-name]`
3. 创建 `tsconfig.json`，继承根目录配置
4. 创建 `rollup.config.js` 配置构建
5. 创建 `src/index.ts` 作为入口

## 🔄 包之间的依赖

使用 workspace 协议声明依赖：

```json
{
  "dependencies": {
    "@firefly-monitor/core": "workspace:*"
  }
}
```

## 📤 发布流程

### 单独发布某个包

```bash
cd packages/browser
npm publish --access public
```

### 批量发布（推荐使用 changeset）

```bash
# 安装 changeset
pnpm add -Dw @changesets/cli

# 初始化
pnpm changeset init

# 创建变更集
pnpm changeset

# 版本升级
pnpm changeset version

# 发布
pnpm changeset publish
```

## ⚙️ Workspace 配置

`pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/*'
```

## 🎯 最佳实践

1. **包职责单一**：每个包应该有明确的职责
2. **避免循环依赖**：保持依赖关系单向
3. **共享配置**：TypeScript、ESLint 等配置在根目录统一管理
4. **版本同步**：建议所有包保持相同版本号
5. **统一发布**：使用工具进行统一的版本管理和发布

## 🔍 问题排查

### TypeScript 找不到包

确保 `tsconfig.json` 中配置了正确的 paths：

```json
{
  "compilerOptions": {
    "paths": {
      "@firefly-monitor/*": ["packages/*/src"]
    }
  }
}
```

### 构建失败

检查依赖顺序，确保被依赖的包先构建：

```bash
# 按依赖顺序构建
pnpm --filter @firefly-monitor/shared run build
pnpm --filter @firefly-monitor/core run build
pnpm --filter @firefly-monitor/browser run build
```

### Lerna vs pnpm workspace

本项目使用 pnpm workspace，轻量且性能好。如需更复杂的版本管理，可考虑 Lerna 或 Changesets。
