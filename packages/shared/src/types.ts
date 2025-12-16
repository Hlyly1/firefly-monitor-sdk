export interface MonitorConfig {
  appId: string;
  url: string;
  enableError?: boolean;
  enablePerformance?: boolean;
  enableBehavior?: boolean;
  sampling?: number;
  maxQueueSize?: number;
  flushInterval?: number;
  debug?: boolean;
}

export interface BaseData {
  appId: string;
  timestamp: number;
  url: string;
  userAgent: string;
  sessionId: string;
}

export interface ErrorData extends BaseData {
  type: 'error';
  errorType: 'js' | 'promise' | 'resource';
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
}

export interface PerformanceData extends BaseData {
  type: 'performance';
  name: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  navigationType?: string;
}

export interface BehaviorData extends BaseData {
  type: 'behavior';
  eventName: string;
  data: Record<string, unknown>;
  target?: string;
}

export type ReportData = ErrorData | PerformanceData | BehaviorData;

export interface Plugin {
  name: string;
  install: (monitor: unknown) => void;
  uninstall?: () => void;
}

export interface ReporterConfig {
  url: string;
  method?: 'beacon' | 'fetch' | 'xhr' | 'img';
  maxQueueSize?: number;
  flushInterval?: number;
}
