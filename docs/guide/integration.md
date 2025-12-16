# 框架集成指南

## React 集成

### 基础集成

```tsx
// main.tsx 或 App.tsx
import { init, Errors, Metrics, Behavior } from '@firefly-monitor/browser'

// 初始化监控
const monitoring = init({
  dsn: 'http://localhost:8080/api/v1/monitoring/reactApp',
  integrations: [
    new Errors(),
    new Metrics(),
    new Behavior()
  ],
  debug: import.meta.env.DEV
})

function App() {
  return (
    <div className="App">
      {/* 你的应用内容 */}
    </div>
  )
}

export default App
```

### 使用 Error Boundary

```tsx
import React, { Component, ReactNode } from 'react'
import { init, Errors } from '@firefly-monitor/browser'

const monitoring = init({
  dsn: 'http://localhost:8080/api/v1/monitoring/reactApp',
  integrations: [new Errors()]
})

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 上报错误到监控系统
    monitoring.captureError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    })
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>
    }

    return this.props.children
  }
}

// 使用
function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  )
}
```

### 使用 React Hooks

```tsx
import { useEffect } from 'react'
import { init, Errors, Metrics } from '@firefly-monitor/browser'

let monitoring: ReturnType<typeof init> | null = null

export function useMonitoring() {
  useEffect(() => {
    if (!monitoring) {
      monitoring = init({
        dsn: 'http://localhost:8080/api/v1/monitoring/reactApp',
        integrations: [new Errors(), new Metrics()]
      })
    }

    return () => {
      // 组件卸载时清理（可选）
      // monitoring?.destroy()
    }
  }, [])

  return monitoring
}

// 在组件中使用
function MyComponent() {
  const monitoring = useMonitoring()

  const handleClick = () => {
    monitoring?.track('button_click', {
      component: 'MyComponent',
      action: 'submit'
    })
  }

  return <button onClick={handleClick}>Submit</button>
}
```

## Vue 集成

### Vue 3

```typescript
// main.ts
import { createApp } from 'vue'
import { init, Errors, Metrics, Behavior } from '@firefly-monitor/browser'
import App from './App.vue'

const app = createApp(App)

// 初始化监控
const monitoring = init({
  dsn: 'http://localhost:8080/api/v1/monitoring/vueApp',
  integrations: [
    new Errors(),
    new Metrics(),
    new Behavior()
  ],
  debug: import.meta.env.DEV
})

// 配置全局错误处理
app.config.errorHandler = (err, instance, info) => {
  monitoring.captureError(err as Error, {
    componentName: instance?.$options.name,
    errorInfo: info
  })
}

// 将监控实例挂载到全局属性
app.config.globalProperties.$monitoring = monitoring

app.mount('#app')
```

### 创建 Vue 插件

```typescript
// plugins/monitoring.ts
import { App, Plugin } from 'vue'
import { init, Errors, Metrics, Behavior, MonitorConfig } from '@firefly-monitor/browser'

export interface MonitoringPluginOptions extends MonitorConfig {
  // 可以添加额外的选项
}

export const MonitoringPlugin: Plugin = {
  install(app: App, options: MonitoringPluginOptions) {
    const monitoring = init({
      integrations: [
        new Errors(),
        new Metrics(),
        new Behavior()
      ],
      ...options
    })

    // 配置全局错误处理
    app.config.errorHandler = (err, instance, info) => {
      monitoring.captureError(err as Error, {
        componentName: instance?.$options.name,
        errorInfo: info
      })
    }

    // 提供给所有组件使用
    app.provide('monitoring', monitoring)
    app.config.globalProperties.$monitoring = monitoring
  }
}

// main.ts 中使用
import { MonitoringPlugin } from './plugins/monitoring'

app.use(MonitoringPlugin, {
  dsn: 'http://localhost:8080/api/v1/monitoring/vueApp',
  debug: import.meta.env.DEV
})
```

### 在组件中使用

```vue
<template>
  <button @click="handleClick">Track Event</button>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { BrowserMonitor } from '@firefly-monitor/browser'

const monitoring = inject<BrowserMonitor>('monitoring')

const handleClick = () => {
  monitoring?.track('button_click', {
    component: 'MyComponent',
    action: 'submit'
  })
}
</script>
```

### Vue 2

```javascript
// main.js
import Vue from 'vue'
import { init, Errors, Metrics } from '@firefly-monitor/browser'
import App from './App.vue'

const monitoring = init({
  dsn: 'http://localhost:8080/api/v1/monitoring/vueApp',
  integrations: [new Errors(), new Metrics()]
})

// 配置全局错误处理
Vue.config.errorHandler = (err, vm, info) => {
  monitoring.captureError(err, {
    componentName: vm.$options.name,
    errorInfo: info
  })
}

// 挂载到 Vue 原型
Vue.prototype.$monitoring = monitoring

new Vue({
  render: h => h(App)
}).$mount('#app')
```

## Next.js 集成

### App Router (Next.js 13+)

```tsx
// app/providers.tsx
'use client'

import { useEffect } from 'react'
import { init, Errors, Metrics, Behavior } from '@firefly-monitor/browser'

let monitoring: ReturnType<typeof init> | null = null

export function Providers({ children }: { children: React.ReactNode }) {
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
import { Providers } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### Pages Router

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { init, Errors, Metrics } from '@firefly-monitor/browser'

let monitoring: ReturnType<typeof init> | null = null

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (!monitoring) {
      monitoring = init({
        dsn: 'http://localhost:8080/api/v1/monitoring/nextApp',
        integrations: [new Errors(), new Metrics()],
        debug: process.env.NODE_ENV === 'development'
      })
    }
  }, [])

  return <Component {...pageProps} />
}

export default MyApp
```

## Nuxt.js 集成

### Nuxt 3

```typescript
// plugins/monitoring.client.ts
import { init, Errors, Metrics, Behavior } from '@firefly-monitor/browser'

export default defineNuxtPlugin((nuxtApp) => {
  const monitoring = init({
    dsn: 'http://localhost:8080/api/v1/monitoring/nuxtApp',
    integrations: [
      new Errors(),
      new Metrics(),
      new Behavior()
    ],
    debug: process.env.NODE_ENV === 'development'
  })

  // 配置全局错误处理
  nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
    monitoring.captureError(err as Error, {
      componentName: instance?.$options.name,
      errorInfo: info
    })
  }

  return {
    provide: {
      monitoring
    }
  }
})

// 在组件中使用
<script setup>
const { $monitoring } = useNuxtApp()

const handleClick = () => {
  $monitoring.track('button_click', {
    page: 'home'
  })
}
</script>
```

### Nuxt 2

```javascript
// plugins/monitoring.client.js
import { init, Errors, Metrics } from '@firefly-monitor/browser'

export default ({ app }, inject) => {
  const monitoring = init({
    dsn: 'http://localhost:8080/api/v1/monitoring/nuxtApp',
    integrations: [new Errors(), new Metrics()]
  })

  app.config.errorHandler = (err, vm, info) => {
    monitoring.captureError(err, {
      componentName: vm.$options.name,
      errorInfo: info
    })
  }

  inject('monitoring', monitoring)
}
```

## Vite 集成

```typescript
// src/main.ts
import { init, Errors, Metrics, Behavior } from '@firefly-monitor/browser'

const monitoring = init({
  dsn: 'http://localhost:8080/api/v1/monitoring/viteApp',
  integrations: [
    new Errors(),
    new Metrics(),
    new Behavior()
  ],
  debug: import.meta.env.DEV,
  // 从环境变量读取配置
  sampling: parseFloat(import.meta.env.VITE_MONITORING_SAMPLING || '1.0')
})

// 导出供全局使用
export { monitoring }
```

## 环境变量配置

### .env 示例

```bash
# 开发环境
VITE_MONITORING_DSN=http://localhost:8080/api/v1/monitoring/dev
VITE_MONITORING_SAMPLING=1.0
VITE_MONITORING_DEBUG=true

# 生产环境
VITE_MONITORING_DSN=https://api.example.com/api/v1/monitoring/prod
VITE_MONITORING_SAMPLING=0.1
VITE_MONITORING_DEBUG=false
```

### 使用环境变量

```typescript
import { init, Errors, Metrics } from '@firefly-monitor/browser'

const monitoring = init({
  dsn: import.meta.env.VITE_MONITORING_DSN || 'default-dsn',
  integrations: [new Errors(), new Metrics()],
  sampling: parseFloat(import.meta.env.VITE_MONITORING_SAMPLING || '1.0'),
  debug: import.meta.env.VITE_MONITORING_DEBUG === 'true'
})
```

## TypeScript 支持

SDK 提供完整的 TypeScript 类型支持。

```typescript
import { 
  init, 
  Errors, 
  Metrics, 
  Behavior,
  BrowserMonitor,
  MonitorConfig,
  ErrorData,
  PerformanceData,
  BehaviorData
} from '@firefly-monitor/browser'

// 配置类型检查
const config: MonitorConfig = {
  dsn: 'http://localhost:8080/api/v1/monitoring/app',
  integrations: [new Errors(), new Metrics()],
  sampling: 1.0,
  debug: true
}

const monitoring: BrowserMonitor = init(config)

// 类型安全的数据上报
monitoring.track('custom_event', {
  key: 'value'
})
```
