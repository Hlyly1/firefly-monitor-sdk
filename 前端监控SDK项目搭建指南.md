# 前端监控SDK项目搭建指南

## 1. 项目概述

前端监控SDK是一个用于收集和上报前端性能、错误、用户行为等数据的npm包，帮助开发者实时监控线上应用的运行状况。

### 1.1 核心目标
- 轻量级、高性能、无侵入
- 支持多种监控维度（性能、错误、行为）
- 支持多种上报方式
- 完善的TypeScript类型支持
- 插件化架构，易于扩展

### 1.2 核心功能
- ✅ 错误监控（JS错误、Promise错误、资源加载错误）
- ✅ 性能监控（FCP、LCP、FID、CLS等Web Vitals指标）
- ✅ 用户行为追踪（点击、路由变化、API请求）
- ✅ 自定义埋点
- ✅ 数据上报（支持sendBeacon、fetch、xhr）
- ✅ 数据采样和过滤
- ✅ 离线缓存

---

## 2. 技术栈选择

### 2.1 开发语言
- **TypeScript**: 提供完善的类型系统

### 2.2 构建工具
- **Rollup**: 适合库的打包，支持多种模块格式输出
- **tsup** (备选): 基于esbuild，构建速度更快

### 2.3 代码规范
- **ESLint**: 代码检查
- **Prettier**: 代码格式化
- **husky + lint-staged**: Git hooks管理

### 2.4 测试工具
- **Jest**: 单元测试
- **Playwright/Cypress**: E2E测试

### 2.5 文档工具
- **VitePress/Docusaurus**: 文档站点
- **TypeDoc**: API文档生成

---

## 3. 项目目录结构

```
firefly-monitor-sdk/
├── packages/                    # monorepo架构（可选）
│   ├── core/                   # 核心包
│   ├── browser/                # 浏览器端包
│   ├── vue/                    # Vue插件
│   └── react/                  # React插件
├── src/                        # 源码目录
│   ├── core/                   # 核心功能
│   │   ├── index.ts           # 核心入口
│   │   ├── monitor.ts         # 监控主类
│   │   ├── config.ts          # 配置管理
│   │   └── types.ts           # 类型定义
│   ├── performance/           # 性能监控模块
│   │   ├── index.ts
│   │   ├── webVitals.ts      # Web Vitals指标
│   │   ├── resource.ts       # 资源加载
│   │   └── navigation.ts     # 页面导航
│   ├── error/                 # 错误监控模块
│   │   ├── index.ts
│   │   ├── jsError.ts        # JS错误
│   │   ├── promiseError.ts   # Promise错误
│   │   ├── resourceError.ts  # 资源错误
│   │   └── vueError.ts       # Vue错误（可选）
│   ├── behavior/              # 行为监控模块
│   │   ├── index.ts
│   │   ├── click.ts          # 点击事件
│   │   ├── route.ts          # 路由变化
│   │   ├── api.ts            # API请求
│   │   └── pageview.ts       # 页面访问
│   ├── reporter/              # 数据上报模块
│   │   ├── index.ts
│   │   ├── beacon.ts         # sendBeacon
│   │   ├── fetch.ts          # fetch
│   │   ├── xhr.ts            # XMLHttpRequest
│   │   └── queue.ts          # 上报队列
│   ├── utils/                 # 工具函数
│   │   ├── index.ts
│   │   ├── device.ts         # 设备信息
│   │   ├── storage.ts        # 本地存储
│   │   ├── validator.ts      # 数据验证
│   │   └── helpers.ts        # 辅助函数
│   ├── plugins/               # 插件系统
│   │   ├── index.ts
│   │   └── base.ts           # 插件基类
│   └── index.ts              # SDK入口
├── examples/                   # 示例项目
│   ├── vanilla/               # 原生JS示例
│   ├── vue/                   # Vue示例
│   └── react/                 # React示例
├── tests/                      # 测试目录
│   ├── unit/                  # 单元测试
│   └── e2e/                   # E2E测试
├── docs/                       # 文档
│   ├── guide/                 # 使用指南
│   ├── api/                   # API文档
│   └── examples/              # 示例代码
├── scripts/                    # 构建脚本
│   ├── build.js
│   └── release.js
├── .github/                    # GitHub配置
│   └── workflows/             # CI/CD
│       ├── test.yml
│       └── release.yml
├── dist/                       # 构建输出（gitignore）
├── node_modules/              # 依赖（gitignore）
├── .eslintrc.js               # ESLint配置
├── .prettierrc.js             # Prettier配置
├── .gitignore
├── tsconfig.json              # TypeScript配置
├── rollup.config.js           # Rollup配置
├── jest.config.js             # Jest配置
├── package.json
├── README.md
├── CHANGELOG.md
└── LICENSE
```

---

## 4. 核心功能模块设计

### 4.1 监控主类（Monitor）

```typescript
class Monitor {
  private config: MonitorConfig;
  private plugins: Plugin[] = [];
  
  constructor(config: MonitorConfig) {
    this.config = this.mergeConfig(config);
    this.init();
  }
  
  private init() {
    // 初始化各个监控模块
    this.initErrorMonitor();
    this.initPerformanceMonitor();
    this.initBehaviorMonitor();
  }
  
  // 安装插件
  use(plugin: Plugin) {
    this.plugins.push(plugin);
    plugin.install(this);
  }
  
  // 自定义上报
  track(eventName: string, data: any) {
    // 上报逻辑
  }
}
```

### 4.2 错误监控模块

**功能点：**
- 全局JS错误捕获（window.onerror）
- Promise未捕获错误（unhandledrejection）
- 资源加载错误
- 跨域脚本错误处理
- 错误堆栈解析
- Source Map支持

**关键实现：**
```typescript
// 监听window.onerror
window.addEventListener('error', (event) => {
  if (event.target !== window) {
    // 资源加载错误
    reportResourceError(event);
  } else {
    // JS错误
    reportJSError(event);
  }
}, true);

// 监听Promise错误
window.addEventListener('unhandledrejection', (event) => {
  reportPromiseError(event);
});
```

### 4.3 性能监控模块

**功能点：**
- Web Vitals指标（FCP、LCP、FID、CLS、TTFB、INP）
- 页面加载时间（DOMContentLoaded、Load）
- 首屏渲染时间
- 资源加载性能（PerformanceResourceTiming）
- 长任务监控（PerformanceObserver）

**关键实现：**
```typescript
// 使用web-vitals库
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

onLCP((metric) => {
  reporter.send({
    type: 'performance',
    name: 'LCP',
    value: metric.value,
    rating: metric.rating
  });
});

// 使用PerformanceObserver
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // 处理性能数据
  }
});
observer.observe({ entryTypes: ['resource', 'navigation', 'paint'] });
```

### 4.4 行为监控模块

**功能点：**
- 用户点击事件
- 页面访问（PV）
- 页面停留时间
- 路由变化监听
- API请求监控（xhr/fetch拦截）
- 用户轨迹回放（可选）

**关键实现：**
```typescript
// 劫持fetch
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const startTime = Date.now();
  return originalFetch.apply(this, args).then(response => {
    const duration = Date.now() - startTime;
    reportAPI({ url: args[0], duration, status: response.status });
    return response;
  });
};

// 监听路由变化
window.addEventListener('popstate', () => {
  reportRouteChange();
});

// 劫持pushState/replaceState
const originalPushState = history.pushState;
history.pushState = function(...args) {
  originalPushState.apply(this, args);
  reportRouteChange();
};
```

### 4.5 数据上报模块

**功能点：**
- 多种上报方式（sendBeacon、fetch、xhr、img）
- 上报队列管理
- 批量上报
- 失败重试
- 数据压缩
- 采样率控制

**关键实现：**
```typescript
class Reporter {
  private queue: ReportData[] = [];
  private timer: number | null = null;
  
  send(data: ReportData) {
    this.queue.push(data);
    
    // 达到阈值立即上报
    if (this.queue.length >= this.config.maxQueueSize) {
      this.flush();
    } else {
      // 延迟上报
      this.scheduleFlush();
    }
  }
  
  private flush() {
    if (this.queue.length === 0) return;
    
    const data = this.queue.splice(0);
    
    // 优先使用sendBeacon
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.config.url, JSON.stringify(data));
    } else {
      // 降级到fetch或xhr
      this.sendByFetch(data);
    }
  }
}
```

### 4.6 插件系统

```typescript
interface Plugin {
  name: string;
  install: (monitor: Monitor) => void;
  uninstall?: () => void;
}

// 示例：Vue错误插件
const VueErrorPlugin: Plugin = {
  name: 'vue-error',
  install(monitor) {
    if (typeof Vue !== 'undefined') {
      Vue.config.errorHandler = (err, vm, info) => {
        monitor.track('vue-error', { err, info });
      };
    }
  }
};
```

---

## 5. 配置文件

### 5.1 package.json

```json
{
  "name": "firefly-monitor-sdk",
  "version": "1.0.0",
  "description": "前端监控SDK",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "browser": "dist/index.umd.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "dev": "rollup -c -w",
    "build": "rollup -c",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "prepublishOnly": "npm run build && npm test",
    "release": "standard-version"
  },
  "keywords": [
    "monitor",
    "frontend",
    "performance",
    "error-tracking",
    "analytics"
  ],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "@rollup/plugin-commonjs": "^25.0.0",
    "@rollup/plugin-node-resolve": "^15.0.0",
    "@rollup/plugin-typescript": "^11.0.0",
    "@types/jest": "^29.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "husky": "^8.0.0",
    "jest": "^29.0.0",
    "lint-staged": "^15.0.0",
    "prettier": "^3.0.0",
    "rollup": "^4.0.0",
    "rollup-plugin-terser": "^7.0.0",
    "standard-version": "^9.5.0",
    "ts-jest": "^29.0.0",
    "typescript": "^5.0.0",
    "vitepress": "^1.0.0"
  },
  "dependencies": {
    "web-vitals": "^3.5.0"
  }
}
```

### 5.2 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2015",
    "module": "ESNext",
    "lib": ["ES2015", "DOM"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests", "examples"]
}
```

### 5.3 rollup.config.js

```javascript
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'FireflyMonitor',
      sourcemap: true,
      globals: {
        'web-vitals': 'webVitals'
      }
    },
  ],
  external: ['web-vitals'],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist',
    }),
    isProduction && terser(),
  ],
};
```

### 5.4 jest.config.js

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### 5.5 .eslintrc.js

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

---

## 6. 开发流程

### 6.1 初始化项目

```bash
# 创建项目目录
mkdir firefly-monitor-sdk && cd firefly-monitor-sdk

# 初始化npm项目
npm init -y

# 安装开发依赖
npm install -D typescript rollup @rollup/plugin-typescript @rollup/plugin-node-resolve @rollup/plugin-commonjs rollup-plugin-terser

# 安装生产依赖
npm install web-vitals

# 初始化TypeScript
npx tsc --init

# 初始化Git
git init
```

### 6.2 开发调试

```bash
# 开发模式（watch）
npm run dev

# 在examples中引入测试
cd examples/vanilla
npm install
npm run dev
```

### 6.3 测试

```bash
# 运行单元测试
npm test

# 测试覆盖率
npm test -- --coverage

# Watch模式
npm run test:watch
```

### 6.4 构建

```bash
# 生产构建
npm run build

# 构建产物：
# - dist/index.cjs.js (CommonJS)
# - dist/index.esm.js (ES Module)
# - dist/index.umd.js (UMD)
# - dist/index.d.ts (TypeScript声明文件)
```

---

## 7. 使用示例

### 7.1 基础使用

```typescript
import FireflyMonitor from 'firefly-monitor-sdk';

// 初始化
const monitor = new FireflyMonitor({
  appId: 'your-app-id',
  url: 'https://api.example.com/monitor',
  enableError: true,
  enablePerformance: true,
  enableBehavior: true,
  sampling: 1.0, // 采样率 0-1
});

// 自定义埋点
monitor.track('button_click', {
  buttonName: '购买按钮',
  pageName: '商品详情页',
});
```

### 7.2 Vue使用

```typescript
import FireflyMonitor from 'firefly-monitor-sdk';
import VueErrorPlugin from 'firefly-monitor-sdk/plugins/vue';

const monitor = new FireflyMonitor({
  appId: 'your-app-id',
  url: 'https://api.example.com/monitor',
});

// 安装Vue插件
monitor.use(VueErrorPlugin);

// Vue 3
app.config.errorHandler = (err, vm, info) => {
  monitor.track('vue-error', { err, info });
};
```

### 7.3 React使用

```typescript
import React from 'react';
import FireflyMonitor from 'firefly-monitor-sdk';

const monitor = new FireflyMonitor({
  appId: 'your-app-id',
  url: 'https://api.example.com/monitor',
});

class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    monitor.track('react-error', { error, errorInfo });
  }
  
  render() {
    return this.props.children;
  }
}
```

---

## 8. 发布流程

### 8.1 版本管理

```bash
# 自动生成CHANGELOG并升级版本
npm run release

# 指定版本类型
npm run release -- --release-as minor
npm run release -- --release-as 1.1.0
```

### 8.2 发布到npm

```bash
# 登录npm
npm login

# 发布
npm publish

# 发布beta版本
npm publish --tag beta
```

### 8.3 CI/CD配置

**GitHub Actions示例：**

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 9. 性能优化建议

### 9.1 SDK体积优化
- Tree-shaking支持
- 按需加载模块
- 压缩和混淆代码
- 移除开发代码（console、注释）

### 9.2 运行时性能
- 使用requestIdleCallback延迟非关键任务
- 事件监听使用防抖/节流
- 上报队列批量处理
- 避免内存泄漏

### 9.3 数据上报优化
- 合理设置采样率
- 数据压缩（gzip）
- 重要数据优先上报
- 页面卸载时确保数据上报（sendBeacon）

---

## 10. 安全性考虑

### 10.1 数据安全
- 敏感数据脱敏（密码、token等）
- HTTPS传输
- 数据签名验证

### 10.2 XSS防护
- 避免eval执行用户输入
- 对收集的用户数据进行转义

### 10.3 隐私合规
- 遵守GDPR等隐私法规
- 提供用户数据采集开关
- 匿名化用户信息

---

## 11. 扩展功能（可选）

### 11.1 录屏回放
- 集成rrweb实现用户操作回放
- 帮助复现bug场景

### 11.2 白屏检测
- 检测页面是否正常渲染
- MutationObserver监听DOM变化

### 11.3 慢请求检测
- 设置请求超时阈值
- 上报慢接口信息

### 11.4 离线数据缓存
- IndexedDB存储未上报数据
- 网络恢复时重新上报

### 11.5 Source Map解析
- 上报压缩后的错误堆栈
- 服务端解析还原源码位置

---

## 12. 文档和示例

### 12.1 必备文档
- README.md - 项目介绍和快速开始
- CHANGELOG.md - 版本变更记录
- API.md - API详细文档
- CONTRIBUTING.md - 贡献指南
- LICENSE - 开源协议

### 12.2 在线文档
使用VitePress/Docusaurus搭建文档站点：
- 快速开始
- 配置项说明
- API参考
- 最佳实践
- FAQ

---

## 13. 后续优化方向

1. **支持多端**
   - 小程序SDK
   - Node.js SDK
   - Electron SDK

2. **可视化平台**
   - 数据展示大屏
   - 错误聚合分析
   - 性能趋势图表
   - 用户行为漏斗

3. **告警系统**
   - 错误率告警
   - 性能指标告警
   - 自定义告警规则

4. **智能分析**
   - 错误自动归类
   - 性能瓶颈分析
   - 用户行为分析

---

## 14. 参考资源

### 开源项目参考
- [web-vitals](https://github.com/GoogleChrome/web-vitals) - Google Web Vitals
- [sentry-javascript](https://github.com/getsentry/sentry-javascript) - Sentry SDK
- [rrweb](https://github.com/rrweb-io/rrweb) - 录屏回放
- [trackjs](https://trackjs.com/) - 商业监控方案

### 技术文章
- [前端监控体系搭建](https://juejin.cn/post/7078512301665419295)
- [如何优雅地上报前端监控数据](https://juejin.cn/post/7017644040981454878)
- [Web Vitals 性能指标](https://web.dev/vitals/)

---

## 15. 总结

这份文档涵盖了前端监控SDK从零到一的完整搭建过程，包括：
- ✅ 项目架构设计
- ✅ 核心功能模块
- ✅ 开发配置文件
- ✅ 构建和发布流程
- ✅ 最佳实践建议

按照这份指南，你可以快速搭建一个功能完善、架构清晰的前端监控SDK。

**下一步行动：**
1. 初始化项目并配置构建环境
2. 实现核心监控模块（错误、性能、行为）
3. 开发数据上报和插件系统
4. 编写单元测试和示例项目
5. 完善文档并发布第一个版本
