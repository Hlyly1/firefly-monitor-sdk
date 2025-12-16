import { MonitorConfig, Plugin, ReportData } from '@firefly-monitor/shared';
import { generateSessionId } from '@firefly-monitor/shared';

export class Monitor {
  protected config: Required<MonitorConfig>;
  protected plugins: Plugin[] = [];
  protected sessionId: string;

  constructor(config: MonitorConfig) {
    this.config = this.mergeConfig(config);
    this.sessionId = generateSessionId();
    this.init();
  }

  protected mergeConfig(config: MonitorConfig): Required<MonitorConfig> {
    return {
      enableError: true,
      enablePerformance: true,
      enableBehavior: true,
      sampling: 1.0,
      maxQueueSize: 10,
      flushInterval: 5000,
      debug: false,
      ...config,
    };
  }

  protected init(): void {
    if (this.config.debug) {
      console.log('[FireflyMonitor] Initialized with config:', this.config);
    }
  }

  use(plugin: Plugin): void {
    this.plugins.push(plugin);
    plugin.install(this);
    if (this.config.debug) {
      console.log(`[FireflyMonitor] Plugin "${plugin.name}" installed`);
    }
  }

  track(eventName: string, data: Record<string, unknown>): void {
    if (this.config.debug) {
      console.log('[FireflyMonitor] Track event:', eventName, data);
    }
  }

  protected report(data: ReportData): void {
    if (this.config.debug) {
      console.log('[FireflyMonitor] Report data:', data);
    }
  }

  destroy(): void {
    this.plugins.forEach((plugin) => {
      if (plugin.uninstall) {
        plugin.uninstall();
      }
    });
    this.plugins = [];
    if (this.config.debug) {
      console.log('[FireflyMonitor] Destroyed');
    }
  }
}
