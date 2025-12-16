import {
  Integration,
  EventCallback,
  MonitorInstance,
} from '@firefly-monitor/shared';
import { getXPath, getSelector, throttle } from '@firefly-monitor/shared';

/**
 * 用户行为监控集成插件
 * 捕获用户的点击、页面浏览、路由变化等行为
 */
export class Behavior implements Integration {
  name = 'Behavior';

  private monitor: MonitorInstance | null = null;
  private clickHandler: ((event: MouseEvent) => void) | null = null;
  private scrollHandler: (() => void) | null = null;
  private visibilityChangeHandler: (() => void) | null = null;
  private pageShowHandler: ((event: PageTransitionEvent) => void) | null = null;
  private pageHideHandler: ((event: PageTransitionEvent) => void) | null = null;
  private hashChangeHandler: (() => void) | null = null;
  private popStateHandler: (() => void) | null = null;

  /**
   * 设置用户行为监控
   * @param _addCallback - 添加回调函数（未使用，直接使用 monitor 实例）
   * @param getCurrentMonitor - 获取当前监控实例
   */
  setupOnce(
    _addCallback: (callback: EventCallback) => void,
    getCurrentMonitor: () => unknown
  ): void {
    this.monitor = getCurrentMonitor() as MonitorInstance;

    this.setupClickTracking();
    this.setupScrollTracking();
    this.setupPageVisibility();
    this.setupPageLifecycle();
    this.setupRouteChange();
  }

  /**
   * 设置点击事件跟踪
   * 捕获用户的所有点击行为
   */
  private setupClickTracking(): void {
    if (!this.monitor) return;

    this.clickHandler = (event: MouseEvent) => {
      if (!this.monitor) return;

      const target = event.target as HTMLElement;
      if (!target) return;

      const selector = getSelector(target);
      const xpath = getXPath(target);
      const text = target.textContent?.trim().slice(0, 100) || '';
      const tagName = target.tagName?.toLowerCase();

      this.monitor.captureBehavior('click', {
        target: selector,
        xpath,
        text,
        tagName,
        x: event.clientX,
        y: event.clientY,
      });
    };

    document.addEventListener('click', this.clickHandler, true);
  }

  /**
   * 设置滚动事件跟踪
   * 使用节流函数避免过多的事件上报
   */
  private setupScrollTracking(): void {
    if (!this.monitor) return;

    const reportScroll = () => {
      if (!this.monitor) return;

      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollPercentage = Math.round(
        (scrollTop / (scrollHeight - clientHeight)) * 100
      );

      this.monitor.captureBehavior('scroll', {
        scrollTop,
        scrollHeight,
        clientHeight,
        scrollPercentage,
      });
    };

    this.scrollHandler = throttle(reportScroll, 1000);
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  /**
   * 设置页面可见性跟踪
   * 监控用户切换标签页等行为
   */
  private setupPageVisibility(): void {
    if (!this.monitor) return;

    this.visibilityChangeHandler = () => {
      if (!this.monitor) return;

      const isHidden = document.hidden;
      const visibilityState = document.visibilityState;

      this.monitor.captureBehavior('visibility_change', {
        hidden: isHidden,
        visibilityState,
      });
    };

    document.addEventListener(
      'visibilitychange',
      this.visibilityChangeHandler
    );
  }

  /**
   * 设置页面生命周期跟踪
   * 监控页面的显示和隐藏（支持往返缓存 BFCache）
   */
  private setupPageLifecycle(): void {
    if (!this.monitor) return;

    this.pageShowHandler = (event: PageTransitionEvent) => {
      if (!this.monitor) return;

      this.monitor.captureBehavior('page_show', {
        persisted: event.persisted,
      });
    };

    this.pageHideHandler = (event: PageTransitionEvent) => {
      if (!this.monitor) return;

      this.monitor.captureBehavior('page_hide', {
        persisted: event.persisted,
      });
    };

    window.addEventListener('pageshow', this.pageShowHandler);
    window.addEventListener('pagehide', this.pageHideHandler);
  }

  /**
   * 设置路由变化跟踪
   * 监控 SPA 应用的路由变化（hash 和 history 模式）
   */
  private setupRouteChange(): void {
    if (!this.monitor) return;

    this.hashChangeHandler = () => {
      if (!this.monitor) return;

      this.monitor.captureBehavior('route_change', {
        type: 'hash',
        from: document.referrer,
        to: window.location.href,
      });
    };

    this.popStateHandler = () => {
      if (!this.monitor) return;

      this.monitor.captureBehavior('route_change', {
        type: 'history',
        from: document.referrer,
        to: window.location.href,
      });
    };

    window.addEventListener('hashchange', this.hashChangeHandler);
    window.addEventListener('popstate', this.popStateHandler);

    this.interceptHistoryMethods();
  }

  /**
   * 拦截 history.pushState 和 history.replaceState
   * 捕获编程式路由变化
   */
  private interceptHistoryMethods(): void {
    if (!this.monitor) return;

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const monitor = this.monitor;

    history.pushState = function (...args) {
      const result = originalPushState.apply(this, args);
      monitor.captureBehavior('route_change', {
        type: 'pushState',
        to: window.location.href,
      });
      return result;
    };

    history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args);
      monitor.captureBehavior('route_change', {
        type: 'replaceState',
        to: window.location.href,
      });
      return result;
    };
  }

  /**
   * 卸载用户行为监控
   * 移除所有事件监听器
   */
  uninstall(): void {
    if (this.clickHandler) {
      document.removeEventListener('click', this.clickHandler, true);
      this.clickHandler = null;
    }
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = null;
    }
    if (this.visibilityChangeHandler) {
      document.removeEventListener(
        'visibilitychange',
        this.visibilityChangeHandler
      );
      this.visibilityChangeHandler = null;
    }
    if (this.pageShowHandler) {
      window.removeEventListener('pageshow', this.pageShowHandler);
      this.pageShowHandler = null;
    }
    if (this.pageHideHandler) {
      window.removeEventListener('pagehide', this.pageHideHandler);
      this.pageHideHandler = null;
    }
    if (this.hashChangeHandler) {
      window.removeEventListener('hashchange', this.hashChangeHandler);
      this.hashChangeHandler = null;
    }
    if (this.popStateHandler) {
      window.removeEventListener('popstate', this.popStateHandler);
      this.popStateHandler = null;
    }
    this.monitor = null;
  }
}
