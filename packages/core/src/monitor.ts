import {
  MonitorConfig,
  Plugin,
  Integration,
  ReportData,
  EventCallback,
  BaseData,
} from '@firefly-monitor/shared';
import { generateSessionId, parseDSN, isSampled } from '@firefly-monitor/shared';
import { Reporter } from './reporter';

/**
 * 监控核心类
 * 负责初始化配置、管理插件、收集和上报数据
 */
export class Monitor {
  protected config: Required<MonitorConfig>;
  protected plugins: Plugin[] = [];
  protected integrations: Integration[] = [];
  protected sessionId: string;
  protected reporter: Reporter;
  protected callbacks: EventCallback[] = [];

  constructor(config: MonitorConfig) {
    this.config = this.mergeConfig(config);
    this.sessionId = generateSessionId();
    this.reporter = new Reporter({
      dsn: this.config.dsn,
      maxQueueSize: this.config.maxQueueSize,
      flushInterval: this.config.flushInterval,
    });
    this.init();
  }

  /**
   * 合并用户配置和默认配置
   * @param config - 用户配置
   * @returns 完整配置
   */
  protected mergeConfig(config: MonitorConfig): Required<MonitorConfig> {
    const { projectId } = parseDSN(config.dsn);
    return {
      dsn: config.dsn,
      appId: config.appId || projectId,
      enableError: config.enableError !== false,
      enablePerformance: config.enablePerformance !== false,
      enableBehavior: config.enableBehavior !== false,
      sampling: config.sampling ?? 1.0,
      maxQueueSize: config.maxQueueSize ?? 10,
      flushInterval: config.flushInterval ?? 5000,
      debug: config.debug ?? false,
      integrations: config.integrations ?? [],
    };
  }

  /**
   * 初始化监控
   * 安装配置中的集成插件
   */
  protected init(): void {
    if (this.config.debug) {
      console.log('[FireflyMonitor] Initialized with config:', this.config);
    }

    this.config.integrations.forEach((integration) => {
      this.addIntegration(integration);
    });
  }

  /**
   * 添加集成插件
   * @param integration - 集成插件实例
   */
  addIntegration(integration: Integration): void {
    this.integrations.push(integration);
    integration.setupOnce(
      (callback) => this.addCallback(callback),
      () => this
    );
    if (this.config.debug) {
      console.log(`[FireflyMonitor] Integration "${integration.name}" added`);
    }
  }

  /**
   * 添加事件回调
   * @param callback - 事件回调函数
   */
  addCallback(callback: EventCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * 使用插件（兼容旧版本）
   * @param plugin - 插件实例
   */
  use(plugin: Plugin): void {
    this.plugins.push(plugin);
    plugin.install(this);
    if (this.config.debug) {
      console.log(`[FireflyMonitor] Plugin "${plugin.name}" installed`);
    }
  }

  /**
   * 跟踪自定义事件
   * @param eventName - 事件名称
   * @param data - 事件数据
   */
  track(eventName: string, data: Record<string, unknown>): void {
    if (this.config.debug) {
      console.log('[FireflyMonitor] Track event:', eventName, data);
    }
    this.captureBehavior(eventName, data);
  }

  /**
   * 捕获错误
   * @param error - 错误对象
   * @param extra - 额外信息
   */
  captureError(error: Error, extra?: Record<string, unknown>): void {
    const data = {
      ...this.getBaseData(),
      type: 'error' as const,
      errorType: 'js' as const,
      message: error.message,
      stack: error.stack,
      ...extra,
    };
    this.report(data);
  }

  /**
   * 捕获性能数据
   * @param name - 性能指标名称
   * @param value - 性能指标值
   * @param extra - 额外信息
   */
  capturePerformance(
    name: string,
    value: number,
    extra?: Record<string, unknown>
  ): void {
    const data = {
      ...this.getBaseData(),
      type: 'performance' as const,
      name,
      value,
      ...extra,
    };
    this.report(data);
  }

  /**
   * 捕获用户行为
   * @param eventName - 事件名称
   * @param data - 事件数据
   */
  captureBehavior(eventName: string, data: Record<string, unknown>): void {
    const reportData = {
      ...this.getBaseData(),
      type: 'behavior' as const,
      eventName,
      data,
    };
    this.report(reportData);
  }

  /**
   * 获取基础数据
   * @returns 基础数据对象
   */
  protected getBaseData(): BaseData {
    return {
      appId: this.config.appId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
    };
  }

  /**
   * 上报数据
   * @param data - 要上报的数据
   */
  protected report(data: ReportData): void {
    if (!isSampled(this.config.sampling)) {
      return;
    }

    this.callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        if (this.config.debug) {
          console.error('[FireflyMonitor] Callback error:', error);
        }
      }
    });

    if (this.config.debug) {
      console.log('[FireflyMonitor] Report data:', data);
    }

    this.reporter.add(data);
  }

  /**
   * 销毁监控实例
   * 清理所有插件和资源
   */
  destroy(): void {
    this.plugins.forEach((plugin) => {
      if (plugin.uninstall) {
        plugin.uninstall();
      }
    });
    this.plugins = [];
    this.integrations = [];
    this.callbacks = [];
    this.reporter.destroy();
    if (this.config.debug) {
      console.log('[FireflyMonitor] Destroyed');
    }
  }
}
