import { ReportData, ReporterConfig } from '@firefly-monitor/shared';
import { safeStringify } from '@firefly-monitor/shared';

/**
 * 数据上报器
 * 负责将收集到的监控数据发送到服务端
 */
export class Reporter {
  private config: Required<ReporterConfig>;
  private queue: ReportData[] = [];
  private timer: number | null = null;

  constructor(config: ReporterConfig) {
    this.config = this.mergeConfig(config);
    this.startTimer();
  }

  /**
   * 合并配置
   * @param config - 用户配置
   * @returns 完整配置
   */
  private mergeConfig(config: ReporterConfig): Required<ReporterConfig> {
    return {
      dsn: config.dsn,
      method: config.method || 'beacon',
      maxQueueSize: config.maxQueueSize || 10,
      flushInterval: config.flushInterval || 5000,
    };
  }

  /**
   * 启动定时器
   * 定期上报队列中的数据
   */
  private startTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = window.setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * 添加数据到队列
   * @param data - 要上报的数据
   */
  add(data: ReportData): void {
    this.queue.push(data);
    if (this.queue.length >= this.config.maxQueueSize) {
      this.flush();
    }
  }

  /**
   * 立即上报队列中的所有数据
   */
  flush(): void {
    if (this.queue.length === 0) return;

    const data = [...this.queue];
    this.queue = [];

    this.send(data);
  }

  /**
   * 发送数据到服务端
   * @param data - 要发送的数据数组
   */
  private send(data: ReportData[]): void {
    const payload = safeStringify(data);

    switch (this.config.method) {
      case 'beacon':
        this.sendBeacon(payload);
        break;
      case 'fetch':
        this.sendFetch(payload);
        break;
      case 'xhr':
        this.sendXHR(payload);
        break;
      case 'img':
        this.sendImage(payload);
        break;
      default:
        this.sendBeacon(payload);
    }
  }

  /**
   * 使用 navigator.sendBeacon 发送数据
   * 优点：页面卸载时也能发送，不阻塞页面
   * @param data - 要发送的数据
   */
  private sendBeacon(data: string): void {
    if (typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([data], { type: 'application/json' });
      navigator.sendBeacon(this.config.dsn, blob);
    } else {
      this.sendFetch(data);
    }
  }

  /**
   * 使用 fetch API 发送数据
   * @param data - 要发送的数据
   */
  private sendFetch(data: string): void {
    if (typeof fetch === 'function') {
      fetch(this.config.dsn, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
        keepalive: true,
      }).catch((error) => {
        console.error('[FireflyMonitor] Failed to send data:', error);
      });
    } else {
      this.sendXHR(data);
    }
  }

  /**
   * 使用 XMLHttpRequest 发送数据
   * @param data - 要发送的数据
   */
  private sendXHR(data: string): void {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', this.config.dsn, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data);
  }

  /**
   * 使用 Image 对象发送数据
   * 通过 URL 参数传递数据（有长度限制）
   * @param data - 要发送的数据
   */
  private sendImage(data: string): void {
    const img = new Image();
    const encoded = encodeURIComponent(data);
    img.src = `${this.config.dsn}?data=${encoded}`;
  }

  /**
   * 销毁上报器
   * 清理定时器并上报剩余数据
   */
  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush();
  }
}
