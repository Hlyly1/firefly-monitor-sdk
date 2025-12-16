import { Monitor } from '@firefly-monitor/core';
import { MonitorConfig } from '@firefly-monitor/shared';

export class BrowserMonitor extends Monitor {
  constructor(config: MonitorConfig) {
    super(config);
    this.initBrowserMonitoring();
  }

  private initBrowserMonitoring(): void {
    if (this.config.enableError) {
      this.setupErrorMonitoring();
    }
    if (this.config.enablePerformance) {
      this.setupPerformanceMonitoring();
    }
    if (this.config.enableBehavior) {
      this.setupBehaviorMonitoring();
    }
  }

  private setupErrorMonitoring(): void {
    if (this.config.debug) {
      console.log('[BrowserMonitor] Error monitoring enabled');
    }
  }

  private setupPerformanceMonitoring(): void {
    if (this.config.debug) {
      console.log('[BrowserMonitor] Performance monitoring enabled');
    }
  }

  private setupBehaviorMonitoring(): void {
    if (this.config.debug) {
      console.log('[BrowserMonitor] Behavior monitoring enabled');
    }
  }
}

export default BrowserMonitor;
export * from '@firefly-monitor/core';
