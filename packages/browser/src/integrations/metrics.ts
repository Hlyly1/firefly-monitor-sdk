import { Integration, EventCallback, MonitorInstance } from '@firefly-monitor/shared';
import { onCLS, onFID, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';

/**
 * 性能指标监控集成插件
 * 收集并上报 Web Vitals 核心性能指标（CLS, FID, LCP, FCP, TTFB）
 */
export class Metrics implements Integration {
  name = 'Metrics';

  private monitor: MonitorInstance | null = null;
  private reported = new Set<string>();

  /**
   * 设置性能监控
   * @param _addCallback - 添加回调函数（未使用，直接使用 monitor 实例）
   * @param getCurrentMonitor - 获取当前监控实例
   */
  setupOnce(
    _addCallback: (callback: EventCallback) => void,
    getCurrentMonitor: () => unknown
  ): void {
    this.monitor = getCurrentMonitor() as MonitorInstance;

    this.setupWebVitals();
    this.setupNavigationTiming();
    this.setupResourceTiming();
  }

  /**
   * 设置 Web Vitals 监控
   * 监控核心 Web 性能指标
   */
  private setupWebVitals(): void {
    if (!this.monitor) return;

    const reportMetric = (metric: Metric) => {
      if (!this.monitor || this.reported.has(metric.name)) return;

      this.reported.add(metric.name);

      const rating = this.getRating(metric.name, metric.value);

      this.monitor.capturePerformance(metric.name, metric.value, {
        rating,
        metricType: 'web-vitals',
        navigationType: metric.navigationType,
      });
    };

    onCLS(reportMetric);
    onFID(reportMetric);
    onLCP(reportMetric);
    onFCP(reportMetric);
    onTTFB(reportMetric);
  }

  /**
   * 获取性能指标评级
   * @param name - 指标名称
   * @param value - 指标值
   * @returns 评级（good/needs-improvement/poor）
   */
  private getRating(
    name: string,
    value: number
  ): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<
      string,
      { good: number; needsImprovement: number }
    > = {
      CLS: { good: 0.1, needsImprovement: 0.25 },
      FID: { good: 100, needsImprovement: 300 },
      LCP: { good: 2500, needsImprovement: 4000 },
      FCP: { good: 1800, needsImprovement: 3000 },
      TTFB: { good: 800, needsImprovement: 1800 },
    };

    const threshold = thresholds[name];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  /**
   * 设置导航时序监控
   * 收集页面加载性能数据
   */
  private setupNavigationTiming(): void {
    if (!this.monitor) return;

    if (typeof window.PerformanceObserver === 'undefined') {
      this.reportNavigationTimingFallback();
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.reportNavigationTiming(
              entry as PerformanceNavigationTiming
            );
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      this.reportNavigationTimingFallback();
    }
  }

  /**
   * 上报导航时序数据
   * @param timing - 性能导航时序对象
   */
  private reportNavigationTiming(timing: PerformanceNavigationTiming): void {
    if (!this.monitor) return;

    const metrics = {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      ssl: timing.secureConnectionStart
        ? timing.connectEnd - timing.secureConnectionStart
        : 0,
      request: timing.responseStart - timing.requestStart,
      response: timing.responseEnd - timing.responseStart,
      dom: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
      load: timing.loadEventEnd - timing.loadEventStart,
      total: timing.loadEventEnd - timing.fetchStart,
    };

    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        this.monitor?.capturePerformance(`navigation.${name}`, value, {
          metricType: 'navigation',
          navigationType: timing.type,
        });
      }
    });
  }

  /**
   * 降级方案：使用 performance.timing 上报导航时序
   */
  private reportNavigationTimingFallback(): void {
    if (!this.monitor) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.timing;
        const navigationStart = timing.navigationStart;

        const metrics = {
          dns: timing.domainLookupEnd - timing.domainLookupStart,
          tcp: timing.connectEnd - timing.connectStart,
          ssl: timing.secureConnectionStart
            ? timing.connectEnd - timing.secureConnectionStart
            : 0,
          request: timing.responseStart - timing.requestStart,
          response: timing.responseEnd - timing.responseStart,
          dom:
            timing.domContentLoadedEventEnd -
            timing.domContentLoadedEventStart,
          load: timing.loadEventEnd - timing.loadEventStart,
          total: timing.loadEventEnd - navigationStart,
        };

        Object.entries(metrics).forEach(([name, value]) => {
          if (value > 0) {
            this.monitor?.capturePerformance(`navigation.${name}`, value, {
              metricType: 'navigation',
            });
          }
        });
      }, 0);
    });
  }

  /**
   * 设置资源加载时序监控
   * 收集静态资源加载性能数据
   */
  private setupResourceTiming(): void {
    if (!this.monitor) return;

    if (typeof window.PerformanceObserver === 'undefined') return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.reportResourceTiming(entry as PerformanceResourceTiming);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.error('[Metrics] Failed to observe resource timing:', error);
    }
  }

  /**
   * 上报资源加载时序数据
   * @param timing - 资源性能时序对象
   */
  private reportResourceTiming(timing: PerformanceResourceTiming): void {
    if (!this.monitor) return;

    const duration = timing.duration;
    if (duration <= 0) return;

    const resourceType = this.getResourceType(timing.name);

    this.monitor.capturePerformance(
      `resource.${resourceType}`,
      duration,
      {
        metricType: 'resource',
        url: timing.name,
        transferSize: timing.transferSize,
        decodedBodySize: timing.decodedBodySize,
        encodedBodySize: timing.encodedBodySize,
      }
    );
  }

  /**
   * 获取资源类型
   * @param url - 资源 URL
   * @returns 资源类型
   */
  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'];
    const scriptExts = ['js', 'jsx', 'ts', 'tsx'];
    const styleExts = ['css', 'scss', 'less'];
    const fontExts = ['woff', 'woff2', 'ttf', 'otf', 'eot'];

    if (extension && imageExts.includes(extension)) return 'image';
    if (extension && scriptExts.includes(extension)) return 'script';
    if (extension && styleExts.includes(extension)) return 'style';
    if (extension && fontExts.includes(extension)) return 'font';
    return 'other';
  }

  /**
   * 卸载性能监控
   */
  uninstall(): void {
    this.monitor = null;
    this.reported.clear();
  }
}
