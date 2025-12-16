import { Integration, EventCallback, MonitorInstance } from '@firefly-monitor/shared';
import { getStackTrace } from '@firefly-monitor/shared';

/**
 * 错误监控集成插件
 * 捕获并上报 JavaScript 错误、Promise 拒绝错误和资源加载错误
 */
export class Errors implements Integration {
  name = 'Errors';

  private errorHandler: ((event: ErrorEvent) => void) | null = null;
  private unhandledRejectionHandler:
    | ((event: PromiseRejectionEvent) => void)
    | null = null;
  private monitor: MonitorInstance | null = null;

  /**
   * 设置错误监控
   * @param _addCallback - 添加回调函数（未使用，直接使用 monitor 实例）
   * @param getCurrentMonitor - 获取当前监控实例
   */
  setupOnce(
    _addCallback: (callback: EventCallback) => void,
    getCurrentMonitor: () => unknown
  ): void {
    this.monitor = getCurrentMonitor() as MonitorInstance;

    this.setupErrorListener();
    this.setupUnhandledRejectionListener();
  }

  /**
   * 设置全局错误监听器
   * 捕获 JavaScript 运行时错误和资源加载错误
   */
  private setupErrorListener(): void {
    this.errorHandler = (event: ErrorEvent) => {
      if (!this.monitor) return;

      const { message, filename, lineno, colno, error } = event;

      if (event.target && (event.target as HTMLElement).tagName) {
        this.captureResourceError(event);
      } else {
        this.captureJSError(message, filename, lineno, colno, error);
      }
    };

    window.addEventListener('error', this.errorHandler, true);
  }

  /**
   * 设置未处理的 Promise 拒绝监听器
   */
  private setupUnhandledRejectionListener(): void {
    this.unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      if (!this.monitor) return;

      const reason = event.reason;
      const message =
        reason instanceof Error ? reason.message : String(reason);
      const stack =
        reason instanceof Error ? getStackTrace(reason) : undefined;

      this.monitor.captureError(
        new Error(`Unhandled Promise Rejection: ${message}`),
        { stack, errorType: 'promise' }
      );
    };

    window.addEventListener(
      'unhandledrejection',
      this.unhandledRejectionHandler
    );
  }

  /**
   * 捕获 JavaScript 错误
   * @param message - 错误消息
   * @param filename - 文件名
   * @param lineno - 行号
   * @param colno - 列号
   * @param error - 错误对象
   */
  private captureJSError(
    message: string,
    filename?: string,
    lineno?: number,
    colno?: number,
    error?: Error
  ): void {
    if (!this.monitor) return;

    const errorObj = error || new Error(message);
    this.monitor.captureError(errorObj, {
      filename,
      lineno,
      colno,
      errorType: 'js',
    });
  }

  /**
   * 捕获资源加载错误
   * @param event - 错误事件
   */
  private captureResourceError(event: ErrorEvent): void {
    if (!this.monitor) return;

    const target = event.target as HTMLElement;
    const tagName = target.tagName?.toLowerCase();
    const src =
      (target as HTMLImageElement | HTMLScriptElement).src ||
      (target as HTMLLinkElement).href;

    this.monitor.captureError(
      new Error(`Failed to load ${tagName}: ${src}`),
      { filename: src, errorType: 'resource' }
    );
  }

  /**
   * 卸载错误监控
   */
  uninstall(): void {
    if (this.errorHandler) {
      window.removeEventListener('error', this.errorHandler, true);
      this.errorHandler = null;
    }
    if (this.unhandledRejectionHandler) {
      window.removeEventListener(
        'unhandledrejection',
        this.unhandledRejectionHandler
      );
      this.unhandledRejectionHandler = null;
    }
    this.monitor = null;
  }
}
