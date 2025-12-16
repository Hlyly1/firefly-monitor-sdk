# Browser API 文档

## init()

初始化浏览器监控 SDK。

### 签名

```typescript
function init(config: MonitorConfig): BrowserMonitor
```

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| config | MonitorConfig | 是 | 监控配置对象 |

### MonitorConfig

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

### 返回值

返回 `BrowserMonitor` 实例。

### 示例

```typescript
import { init, Errors, Metrics } from '@firefly-monitor/browser'

const monitoring = init({
  dsn: 'http://localhost:8080/api/v1/monitoring/reactqL9vG',
  integrations: [new Errors(), new Metrics()],
  sampling: 1.0,
  debug: true
})
```

---

## BrowserMonitor

浏览器监控类，提供监控数据收集和上报功能。

### 构造函数

```typescript
new BrowserMonitor(config: MonitorConfig)
```

### 方法

#### track()

跟踪自定义事件。

```typescript
track(eventName: string, data: Record<string, unknown>): void
```

**参数：**
- `eventName`: 事件名称
- `data`: 事件数据对象

**示例：**
```typescript
monitoring.track('button_click', {
  buttonId: 'purchase-btn',
  product: 'premium-plan'
})
```

#### captureError()

手动捕获错误。

```typescript
captureError(error: Error, extra?: Record<string, unknown>): void
```

**参数：**
- `error`: 错误对象
- `extra`: 额外信息（可选）

**示例：**
```typescript
try {
  riskyOperation()
} catch (error) {
  monitoring.captureError(error, {
    context: 'user-operation',
    userId: '12345'
  })
}
```

#### capturePerformance()

手动捕获性能数据。

```typescript
capturePerformance(
  name: string, 
  value: number, 
  extra?: Record<string, unknown>
): void
```

**参数：**
- `name`: 性能指标名称
- `value`: 性能指标值（毫秒）
- `extra`: 额外信息（可选）

**示例：**
```typescript
const startTime = performance.now()
await loadData()
const duration = performance.now() - startTime

monitoring.capturePerformance('data_loading', duration, {
  metricType: 'custom',
  dataSize: 1024
})
```

#### captureBehavior()

手动捕获用户行为。

```typescript
captureBehavior(eventName: string, data: Record<string, unknown>): void
```

**参数：**
- `eventName`: 行为事件名称
- `data`: 行为数据对象

**示例：**
```typescript
monitoring.captureBehavior('form_submit', {
  formId: 'contact-form',
  fields: ['name', 'email', 'message']
})
```

#### destroy()

销毁监控实例，清理所有资源。

```typescript
destroy(): void
```

**示例：**
```typescript
monitoring.destroy()
```

---

## 集成插件

### Errors

错误监控插件，自动捕获各类错误。

#### 构造函数

```typescript
new Errors()
```

#### 捕获的错误类型

- JavaScript 运行时错误
- Promise 拒绝错误
- 资源加载错误

#### 示例

```typescript
import { init, Errors } from '@firefly-monitor/browser'

const monitoring = init({
  dsn: 'your-dsn',
  integrations: [new Errors()]
})
```

---

### Metrics

性能监控插件，自动收集性能指标。

#### 构造函数

```typescript
new Metrics()
```

#### 收集的指标

**Web Vitals:**
- CLS (Cumulative Layout Shift)
- FID (First Input Delay)
- LCP (Largest Contentful Paint)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

**导航时序:**
- DNS 查询时间
- TCP 连接时间
- SSL 握手时间
- 请求响应时间
- DOM 解析时间
- 页面加载时间

**资源加载时序:**
- 图片、脚本、样式、字体等资源的加载性能

#### 示例

```typescript
import { init, Metrics } from '@firefly-monitor/browser'

const monitoring = init({
  dsn: 'your-dsn',
  integrations: [new Metrics()]
})
```

---

### Behavior

用户行为监控插件，自动跟踪用户行为。

#### 构造函数

```typescript
new Behavior()
```

#### 跟踪的行为

- 点击事件
- 页面滚动
- 页面可见性变化
- 路由变化（hash/history）
- 页面生命周期

#### 示例

```typescript
import { init, Behavior } from '@firefly-monitor/browser'

const monitoring = init({
  dsn: 'your-dsn',
  integrations: [new Behavior()]
})
```

---

## 数据类型

### ErrorData

错误数据接口。

```typescript
interface ErrorData {
  type: 'error'
  errorType: 'js' | 'promise' | 'resource' | 'xhr' | 'fetch'
  message: string
  stack?: string
  filename?: string
  lineno?: number
  colno?: number
  componentStack?: string
  appId: string
  timestamp: number
  url: string
  userAgent: string
  sessionId: string
}
```

### PerformanceData

性能数据接口。

```typescript
interface PerformanceData {
  type: 'performance'
  name: string
  value: number
  rating?: 'good' | 'needs-improvement' | 'poor'
  navigationType?: string
  metricType?: 'web-vitals' | 'navigation' | 'resource' | 'custom'
  appId: string
  timestamp: number
  url: string
  userAgent: string
  sessionId: string
}
```

### BehaviorData

用户行为数据接口。

```typescript
interface BehaviorData {
  type: 'behavior'
  eventName: string
  data: Record<string, unknown>
  target?: string
  xpath?: string
  appId: string
  timestamp: number
  url: string
  userAgent: string
  sessionId: string
}
```

---

## Integration 接口

自定义集成插件接口。

```typescript
interface Integration {
  name: string
  setupOnce: (
    addCallback: (callback: EventCallback) => void,
    getCurrentMonitor: () => unknown
  ) => void
}
```

### 示例

```typescript
import { Integration, MonitorInstance } from '@firefly-monitor/browser'

class MyIntegration implements Integration {
  name = 'MyIntegration'
  private monitor: MonitorInstance | null = null

  setupOnce(
    _addCallback: (callback: EventCallback) => void,
    getCurrentMonitor: () => unknown
  ): void {
    this.monitor = getCurrentMonitor() as MonitorInstance
    // 实现监控逻辑
  }

  uninstall?(): void {
    // 清理资源
    this.monitor = null
  }
}
```
