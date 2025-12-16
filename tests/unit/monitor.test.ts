import { Monitor } from '@firefly-monitor/core';
import { MonitorConfig } from '@firefly-monitor/shared';

describe('Monitor', () => {
  let monitor: Monitor;
  const config: MonitorConfig = {
    appId: 'test-app',
    url: 'https://api.example.com/monitor',
  };

  beforeEach(() => {
    monitor = new Monitor(config);
  });

  afterEach(() => {
    monitor.destroy();
  });

  it('should initialize with correct config', () => {
    expect(monitor).toBeDefined();
  });

  it('should track custom events', () => {
    expect(() => {
      monitor.track('test_event', { key: 'value' });
    }).not.toThrow();
  });

  it('should support plugin system', () => {
    const mockPlugin = {
      name: 'test-plugin',
      install: jest.fn(),
    };

    monitor.use(mockPlugin);
    expect(mockPlugin.install).toHaveBeenCalledWith(monitor);
  });
});
