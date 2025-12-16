# Firefly Monitor SDK 使用示例

本文档提供了完整的使用示例，帮助你快速集成 Firefly Monitor SDK。

## 基础示例

### 1. 最简单的集成方式

```typescript
import { init, Errors, Metrics } from '@firefly-monitor/browser'

const monitoring = init({
  dsn: 'http://localhost:8080/api/v1/monitoring/reactqL9vG',
  integrations: [new Errors(), new Metrics()],
})
```

这就完成了！SDK 会自动开始收集错误和性能数据。

## 完整配置示例

### 2. 生产环境配置

```typescript
import { init, Errors, Metrics, Behavior } from '@firefly-monitor/browser'

const monitoring = init({
  // 数据上报地址（必填）
  dsn: 'http://localhost:8080/api/v1/monitoring/reactqL9vG',
  
  // 应用标识（可选，默认从 dsn 解析）
  appId: 'my-awesome-app',
  
  // 采样率：生产环境建议 10-20%（可选，默认 100%）
  sampling: 0.1,
  
  // 队列配置（可选）
  maxQueueSize: 30,      // 队列达到30条时立即上报
  flushInterval: 10000,  // 或每10秒上报一次
  
  // 调试模式：仅在开发环境开启（可选）
  debug: process.env.NODE_ENV === 'development',
  
  // 集成插件列表
  integrations: [
    new Errors(),      // 错误监控
    new Metrics(),     // 性能监控
    new Behavior()     // 用户行为跟踪
  ],
})
```

## 框架集成示例

### 3. React 项目

```tsx
// src/monitoring.ts
import { init, Errors, Metrics, Behavior } from '@firefly-monitor/browser'

export const monitoring = init({
  dsn: 'http://localhost:8080/api/v1/monitoring/reactApp',
  integrations: [
    new Errors(),
    new Metrics(),
    new Behavior()
  ],
  debug: import.meta.env.DEV
})

// src/App.tsx
import { monitoring } from './monitoring'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // SDK 已自动初始化，这里可以发送自定义事件
    monitoring.track('app_mounted', {
      timestamp: Date.now()
    })
  }, [])

  return (
    <div className="App">
      <h1>My App</h1>
    </div>
  )
}

export default App
```

### 4. Vue 3 项目

```typescript
// src/plugins/monitoring.ts
import { App } from 'vue'
import { init, Errors, Metrics, Behavior } from '@firefly-monitor/browser'

export function setupMonitoring(app: App) {
  const monitoring = init({
    dsn: 'http://localhost:8080/api/v1/monitoring/vueApp',
    integrations: [
      new Errors(),
      new Metrics(),
      new Behavior()
    ],
    debug: import.meta.env.DEV
  })

  // 配置 Vue 全局错误处理
  app.config.errorHandler = (err, instance, info) => {
    monitoring.captureError(err as Error, {
      componentName: instance?.$options.name,
      errorInfo: info
    })
  }

  // 提供给组件使用
  app.provide('monitoring', monitoring)
  app.config.globalProperties.$monitoring = monitoring

  return monitoring
}

// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { setupMonitoring } from './plugins/monitoring'

const app = createApp(App)
setupMonitoring(app)
app.mount('#app')
```

### 5. Next.js 项目

```tsx
// app/providers.tsx
'use client'

import { useEffect } from 'react'
import { init, Errors, Metrics, Behavior } from '@firefly-monitor/browser'

let monitoring: ReturnType<typeof init> | null = null

export function MonitoringProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  useEffect(() => {
    if (!monitoring && typeof window !== 'undefined') {
      monitoring = init({
        dsn: 'http://localhost:8080/api/v1/monitoring/nextApp',
        integrations: [
          new Errors(),
          new Metrics(),
          new Behavior()
        ],
        debug: process.env.NODE_ENV === 'development'
      })
    }
  }, [])

  return <>{children}</>
}

// app/layout.tsx
import { MonitoringProvider } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <MonitoringProvider>
          {children}
        </MonitoringProvider>
      </body>
    </html>
  )
}
```

## 手动数据上报示例

### 6. 捕获自定义错误

```typescript
import { monitoring } from './monitoring'

async function fetchUserData(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    // 手动上报错误
    monitoring.captureError(error as Error, {
      context: 'fetchUserData',
      userId,
      extra: 'Additional context'
    })
    throw error
  }
}
```

### 7. 上报性能数据

```typescript
import { monitoring } from './monitoring'

async function loadLargeData() {
  const startTime = performance.now()
  
  try {
    await fetchData()
    
    const duration = performance.now() - startTime
    
    // 上报性能数据
    monitoring.capturePerformance('data_loading', duration, {
      metricType: 'custom',
      success: true
    })
  } catch (error) {
    const duration = performance.now() - startTime
    
    monitoring.capturePerformance('data_loading', duration, {
      metricType: 'custom',
      success: false
    })
    
    throw error
  }
}
```

### 8. 跟踪用户行为

```typescript
import { monitoring } from './monitoring'

function ProductCard({ product }) {
  const handleAddToCart = () => {
    // 上报用户行为
    monitoring.captureBehavior('add_to_cart', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      timestamp: Date.now()
    })
    
    // 执行添加到购物车的逻辑
    addToCart(product)
  }

  const handleViewDetails = () => {
    monitoring.track('product_view', {
      productId: product.id,
      category: product.category
    })
    
    navigateToDetails(product.id)
  }

  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={handleViewDetails}>查看详情</button>
      <button onClick={handleAddToCart}>加入购物车</button>
    </div>
  )
}
```

## 高级用法示例

### 9. 条件性加载插件

```typescript
import { init, Errors, Metrics, Behavior } from '@firefly-monitor/browser'

// 根据环境变量决定加载哪些插件
const integrations = [
  new Errors() // 错误监控始终启用
]

// 生产环境才启用性能监控
if (process.env.NODE_ENV === 'production') {
  integrations.push(new Metrics())
}

// 需要用户分析时才启用行为跟踪
if (process.env.VITE_ENABLE_BEHAVIOR_TRACKING === 'true') {
  integrations.push(new Behavior())
}

const monitoring = init({
  dsn: 'http://localhost:8080/api/v1/monitoring/app',
  integrations,
  sampling: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
})
```

### 10. 创建自定义集成插件

```typescript
import { Integration, MonitorInstance } from '@firefly-monitor/browser'

// 自定义网络请求监控插件
class NetworkMonitoring implements Integration {
  name = 'NetworkMonitoring'
  private monitor: MonitorInstance | null = null

  setupOnce(
    _addCallback: (callback: any) => void,
    getCurrentMonitor: () => unknown
  ): void {
    this.monitor = getCurrentMonitor() as MonitorInstance
    this.interceptFetch()
    this.interceptXHR()
  }

  private interceptFetch(): void {
    const originalFetch = window.fetch
    const monitor = this.monitor

    window.fetch = function(...args) {
      const startTime = performance.now()
      const url = typeof args[0] === 'string' ? args[0] : args[0].url
      
      return originalFetch.apply(this, args)
        .then(response => {
          const duration = performance.now() - startTime
          
          monitor?.capturePerformance('fetch_request', duration, {
            url,
            status: response.status,
            ok: response.ok
          })
          
          return response
        })
        .catch(error => {
          const duration = performance.now() - startTime
          
          monitor?.captureError(error, {
            type: 'fetch_error',
            url,
            duration
          })
          
          throw error
        })
    }
  }

  private interceptXHR(): void {
    // 类似的 XHR 拦截实现
  }

  uninstall(): void {
    this.monitor = null
  }
}

// 使用自定义插件
const monitoring = init({
  dsn: 'http://localhost:8080/api/v1/monitoring/app',
  integrations: [
    new Errors(),
    new Metrics(),
    new NetworkMonitoring()  // 使用自定义插件
  ]
})
```

## 环境配置示例

### 11. 使用环境变量

```typescript
// .env.development
VITE_MONITORING_DSN=http://localhost:8080/api/v1/monitoring/dev
VITE_MONITORING_SAMPLING=1.0
VITE_MONITORING_DEBUG=true

// .env.production
VITE_MONITORING_DSN=https://api.example.com/api/v1/monitoring/prod
VITE_MONITORING_SAMPLING=0.1
VITE_MONITORING_DEBUG=false

// src/monitoring.ts
import { init, Errors, Metrics } from '@firefly-monitor/browser'

export const monitoring = init({
  dsn: import.meta.env.VITE_MONITORING_DSN,
  integrations: [new Errors(), new Metrics()],
  sampling: parseFloat(import.meta.env.VITE_MONITORING_SAMPLING || '1.0'),
  debug: import.meta.env.VITE_MONITORING_DEBUG === 'true'
})
```

## 调试技巧

### 12. 开启调试模式

```typescript
const monitoring = init({
  dsn: 'http://localhost:8080/api/v1/monitoring/app',
  integrations: [new Errors(), new Metrics()],
  
  // 开启调试模式，控制台会输出详细信息
  debug: true
})

// 你会在控制台看到类似的输出：
// [FireflyMonitor] Initialized with config: {...}
// [FireflyMonitor] Integration "Errors" added
// [FireflyMonitor] Integration "Metrics" added
// [FireflyMonitor] Report data: {...}
```

### 13. 测试上报功能

```typescript
// 测试错误上报
monitoring.captureError(new Error('Test error'), {
  test: true
})

// 测试性能上报
monitoring.capturePerformance('test_metric', 123, {
  test: true
})

// 测试行为上报
monitoring.track('test_event', {
  test: true,
  timestamp: Date.now()
})
```

## 最佳实践

### 14. 完整的生产环境配置

```typescript
import { init, Errors, Metrics, Behavior } from '@firefly-monitor/browser'

// 生产环境推荐配置
export const monitoring = init({
  // 使用环境变量
  dsn: import.meta.env.VITE_MONITORING_DSN,
  
  // 设置合理的采样率（10%）
  sampling: 0.1,
  
  // 优化队列配置
  maxQueueSize: 30,
  flushInterval: 10000,
  
  // 仅在开发环境开启调试
  debug: import.meta.env.DEV,
  
  // 按需加载插件
  integrations: [
    new Errors(),    // 错误监控必备
    new Metrics(),   // 性能监控
    // new Behavior() // 用户行为跟踪按需开启
  ],
})

// 在应用卸载时清理
window.addEventListener('beforeunload', () => {
  monitoring.destroy()
})
```

## 总结

Firefly Monitor SDK 提供了灵活的配置选项和强大的插件系统：

1. **简单集成** - 只需几行代码即可开始使用
2. **插件化架构** - 按需加载，减少包体积
3. **框架无关** - 支持 React、Vue、Next.js 等主流框架
4. **自动收集** - 自动捕获错误、性能数据和用户行为
5. **手动上报** - 提供灵活的 API 进行自定义上报
6. **可扩展** - 支持创建自定义集成插件

更多详细文档请参考：
- [使用指南](./docs/guide/usage.md)
- [框架集成](./docs/guide/integration.md)
- [API 文档](./docs/api/browser.md)
