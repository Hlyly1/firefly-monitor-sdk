/**
 * 监控SDK配置接口
 */
export interface MonitorConfig {
  dsn: string;
  appId?: string;
  enableError?: boolean;
  enablePerformance?: boolean;
  enableBehavior?: boolean;
  sampling?: number;
  maxQueueSize?: number;
  flushInterval?: number;
  debug?: boolean;
  integrations?: Integration[];
}

/**
 * 基础数据接口
 */
export interface BaseData {
  appId: string;
  timestamp: number;
  url: string;
  userAgent: string;
  sessionId: string;
}

/**
 * 错误数据接口
 */
export interface ErrorData extends BaseData {
  type: 'error';
  errorType: 'js' | 'promise' | 'resource' | 'xhr' | 'fetch';
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  componentStack?: string;
}

/**
 * 性能数据接口
 */
export interface PerformanceData extends BaseData {
  type: 'performance';
  name: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  navigationType?: string;
  metricType?: 'web-vitals' | 'navigation' | 'resource' | 'custom';
}

/**
 * 用户行为数据接口
 */
export interface BehaviorData extends BaseData {
  type: 'behavior';
  eventName: string;
  data: Record<string, unknown>;
  target?: string;
  xpath?: string;
}

/**
 * 上报数据类型
 */
export type ReportData = ErrorData | PerformanceData | BehaviorData;

/**
 * 插件接口（兼容旧版本）
 */
export interface Plugin {
  name: string;
  install: (monitor: unknown) => void;
  uninstall?: () => void;
}

/**
 * 集成插件接口
 */
export interface Integration {
  name: string;
  setupOnce: (
    addCallback: (callback: EventCallback) => void,
    getCurrentMonitor: () => unknown
  ) => void;
}

/**
 * 事件回调函数
 */
export type EventCallback = (data: ReportData) => void;

/**
 * 上报器配置接口
 */
export interface ReporterConfig {
  dsn: string;
  method?: 'beacon' | 'fetch' | 'xhr' | 'img';
  maxQueueSize?: number;
  flushInterval?: number;
}

/**
 * 监控实例接口
 */
export interface MonitorInstance {
  use: (plugin: Plugin) => void;
  track: (eventName: string, data: Record<string, unknown>) => void;
  captureError: (error: Error, extra?: Record<string, unknown>) => void;
  capturePerformance: (name: string, value: number, extra?: Record<string, unknown>) => void;
  captureBehavior: (eventName: string, data: Record<string, unknown>) => void;
  destroy: () => void;
}
