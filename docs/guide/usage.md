# 使用指南

## 基本用法

### 初始化 SDK

使用 `init` 函数是最简单的初始化方式：

```typescript
import { init, Errors, Metrics } from '@firefly-monitor/browser'

const monitoring = init({
  dsn: 'http://localhost:8080/api/v1/monitoring/reactqL9vG',
  integrations: [new Errors(), new Metrics()],
})
```

### 配置选项

```typescript
interface MonitorConfig {
  dsn: string                    // 数据上报地址（必填）
  appId?: string                 // 应用ID（可选，默认从 dsn 中解析）
  enableError?: boolean          // 是否启用错误监控（默认：true）
  enablePerformance?: boolean    // 是否启用性能监控（默认：true）
  enableBehavior?: boolean       // 是否启用行为监控（默认：true）
  sampling?: number              // 采样率 0-1（默认：1.0 全量采集）
  maxQueueSize?: number          // 队列最大长度（默认：10）
  flushInterval?: number         // 上报间隔（毫秒，默认：5000）
  debug?: boolean                // 是否开启调试模式（默认：false）
  integrations?: Integration[]   // 集成插件列表
}
```

### 完整示例

```typescript
import { init, Errors, Metrics, Behavior } from '@firefly-monitor/browser'

const monitoring = init({
  dsn: 'http://localhost:8080/api/v1/monitoring/reactqL9vG',
  
  // 自定义应用ID
  appId: 'my-awesome-app',
  
  // 配置采样率（50%采样）
  sampling: 0.5,
  
  // 配置上报参数
  maxQueueSize: 20,
  flushInterval: 3000,
  
  // 开启调试模式
  debug: true,
  
  // 配置集成插件
  integrations: [
    new Errors(),
    new Metrics(),
    new Behavior()
  ],
})
```

## 手动上报数据

### 上报错误

```typescript
try {
  // 你的代码
} catch (error) {
  monitoring.captureError(error, {
    extra: 'additional context'
  })
}
```

### 上报性能数据

```typescript
const startTime = performance.now()
// 执行某些操作
const duration = performance.now() - startTime

monitoring.capturePerformance('custom_operation', duration, {
  metricType: 'custom'
})
```

### 上报用户行为

```typescript
monitoring.captureBehavior('button_click', {
  buttonId: 'purchase-btn',
  product: 'premium-plan'
})
```

### 跟踪自定义事件

```typescript
monitoring.track('user_action', {
  action: 'download',
  fileType: 'pdf',
  fileName: 'report.pdf'
})
```

## 集成插件详解

### Errors - 错误监控

`Errors` 插件会自动捕获以下类型的错误：

#### 1. JavaScript 运行时错误

```javascript
// 这种错误会被自动捕获
const obj = null
obj.method() // TypeError
```

#### 2. Promise 拒绝错误

```javascript
// 这种错误会被自动捕获
Promise.reject('Something went wrong')

// 或者
async function fetchData() {
  throw new Error('Failed to fetch')
}
fetchData() // 未处理的 Promise 拒绝
```

#### 3. 资源加载错误

```html
<!-- 这种错误会被自动捕获 -->
<img src="non-existent-image.jpg" />
<script src="missing-script.js"></script>
```

### Metrics - 性能监控

`Metrics` 插件会自动收集以下性能指标：

#### 1. Web Vitals 核心指标

- **CLS (Cumulative Layout Shift)**: 累积布局偏移
- **FID (First Input Delay)**: 首次输入延迟
- **LCP (Largest Contentful Paint)**: 最大内容绘制
- **FCP (First Contentful Paint)**: 首次内容绘制
- **TTFB (Time to First Byte)**: 首字节时间

每个指标都会自动计算评级（good/needs-improvement/poor）。

#### 2. 导航时序

- DNS 查询时间
- TCP 连接时间
- SSL 握手时间
- 请求响应时间
- DOM 解析时间
- 页面加载时间

#### 3. 资源加载时序

自动监控所有资源的加载性能：

- 图片（jpg, png, webp, svg等）
- 脚本（js, ts等）
- 样式（css, scss等）
- 字体（woff, ttf等）

### Behavior - 用户行为监控

`Behavior` 插件会自动跟踪以下用户行为：

#### 1. 点击事件

捕获所有点击行为，包括：
- 元素选择器
- XPath 路径
- 点击位置坐标
- 元素文本内容

#### 2. 页面滚动

使用节流机制，每秒最多上报一次：
- 滚动位置
- 滚动百分比
- 页面高度

#### 3. 页面可见性

监控标签页切换行为：
- 页面是否隐藏
- 可见性状态

#### 4. 路由变化

支持多种路由模式：
- Hash 路由（#/path）
- History 路由（/path）
- 编程式路由（pushState/replaceState）

#### 5. 页面生命周期

监控页面的显示和隐藏事件，支持 BFCache（往返缓存）。

## 高级用法

### 创建自定义集成插件

```typescript
import { Integration, EventCallback, MonitorInstance } from '@firefly-monitor/browser'

class MyCustomIntegration implements Integration {
  name = 'MyCustomIntegration'
  private monitor: MonitorInstance | null = null

  setupOnce(
    addCallback: (callback: EventCallback) => void,
    getCurrentMonitor: () => unknown
  ): void {
    this.monitor = getCurrentMonitor() as MonitorInstance

    // 设置你的监控逻辑
    this.setupCustomTracking()
  }

  private setupCustomTracking(): void {
    // 例如：监控网络请求
    const originalFetch = window.fetch
    const monitor = this.monitor

    window.fetch = function(...args) {
      const startTime = performance.now()
      
      return originalFetch.apply(this, args)
        .then(response => {
          const duration = performance.now() - startTime
          monitor?.capturePerformance('fetch', duration, {
            url: args[0],
            status: response.status
          })
          return response
        })
        .catch(error => {
          monitor?.captureError(error, {
            type: 'fetch',
            url: args[0]
          })
          throw error
        })
    }
  }

  uninstall(): void {
    // 清理资源
    this.monitor = null
  }
}

// 使用自定义插件
const monitoring = init({
  dsn: 'your-dsn',
  integrations: [
    new Errors(),
    new MyCustomIntegration()
  ]
})
```

### 条件性启用插件

```typescript
const integrations = [new Errors()]

// 仅在生产环境启用性能监控
if (process.env.NODE_ENV === 'production') {
  integrations.push(new Metrics())
}

// 仅在需要时启用行为监控
if (needsBehaviorTracking) {
  integrations.push(new Behavior())
}

const monitoring = init({
  dsn: 'your-dsn',
  integrations
})
```

### 销毁监控实例

```typescript
// 当不再需要监控时
monitoring.destroy()
```

## 最佳实践

### 1. 合理设置采样率

对于高流量应用，建议设置合适的采样率：

```typescript
const monitoring = init({
  dsn: 'your-dsn',
  sampling: 0.1, // 10% 采样
  integrations: [new Errors(), new Metrics()]
})
```

### 2. 使用调试模式开发

开发时开启调试模式，便于查看上报数据：

```typescript
const monitoring = init({
  dsn: 'your-dsn',
  debug: process.env.NODE_ENV === 'development',
  integrations: [new Errors(), new Metrics()]
})
```

### 3. 按需加载插件

只加载你需要的插件，减少包体积：

```typescript
// ❌ 不推荐：加载所有插件
import { init, Errors, Metrics, Behavior } from '@firefly-monitor/browser'

// ✅ 推荐：只加载需要的插件
import { init, Errors, Metrics } from '@firefly-monitor/browser'
```

### 4. 设置合理的队列大小

根据应用特点调整队列大小和上报间隔：

```typescript
const monitoring = init({
  dsn: 'your-dsn',
  maxQueueSize: 30,      // 队列达到30条时立即上报
  flushInterval: 10000,  // 或每10秒上报一次
  integrations: [new Errors()]
})
```

### 5. 添加全局错误处理

```typescript
const monitoring = init({
  dsn: 'your-dsn',
  integrations: [new Errors()]
})

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})
```
