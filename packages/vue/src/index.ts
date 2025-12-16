import { Plugin as VuePlugin, App } from 'vue';
import { BrowserMonitor } from '@firefly-monitor/browser';
import { MonitorConfig } from '@firefly-monitor/shared';

export interface FireflyVuePluginOptions extends MonitorConfig {
  captureVueErrors?: boolean;
}

export const FireflyVuePlugin: VuePlugin = {
  install(app: App, options: FireflyVuePluginOptions) {
    const monitor = new BrowserMonitor(options);

    if (options.captureVueErrors !== false) {
      app.config.errorHandler = (err, instance, info) => {
        monitor.track('vue-error', {
          error: err,
          componentName: instance?.$options.name || 'Unknown',
          info,
        });
      };
    }

    app.config.globalProperties.$monitor = monitor;
    app.provide('monitor', monitor);
  },
};

export { BrowserMonitor };
export * from '@firefly-monitor/browser';
