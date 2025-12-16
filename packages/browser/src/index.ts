import { Monitor } from '@firefly-monitor/core';
import { MonitorConfig } from '@firefly-monitor/shared';
import { Errors } from './integrations/errors';
import { Metrics } from './integrations/metrics';
import { Behavior } from './integrations/behavior';

/**
 * 浏览器监控类
 * 扩展核心监控类，添加浏览器特定的功能
 */
export class BrowserMonitor extends Monitor {
  constructor(config: MonitorConfig) {
    super(config);
  }
}

/**
 * 初始化监控 SDK
 * @param config - 监控配置
 * @returns 监控实例
 * 
 * @example
 * ```typescript
 * import { init, Errors, Metrics } from '@firefly-monitor/browser'
 * 
 * const monitoring = init({
 *   dsn: 'http://localhost:8080/api/v1/monitoring/reactqL9vG',
 *   integrations: [new Errors(), new Metrics()],
 * })
 * ```
 */
export function init(config: MonitorConfig): BrowserMonitor {
  const integrations = config.integrations || [];
  
  if (config.enableError !== false && !integrations.some(i => i.name === 'Errors')) {
    integrations.push(new Errors());
  }
  
  if (config.enablePerformance !== false && !integrations.some(i => i.name === 'Metrics')) {
    integrations.push(new Metrics());
  }
  
  if (config.enableBehavior !== false && !integrations.some(i => i.name === 'Behavior')) {
    integrations.push(new Behavior());
  }

  const monitor = new BrowserMonitor({
    ...config,
    integrations,
  });

  if (config.debug) {
    console.log('[FireflyMonitor] Browser monitor initialized');
  }

  return monitor;
}

export { Errors, Metrics, Behavior };
export default BrowserMonitor;
export * from '@firefly-monitor/core';
