/**
 * 生成会话ID
 * @returns {string} 会话ID
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 获取设备信息
 * @returns {object} 设备信息对象
 */
export function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
  };
}

/**
 * 判断是否应该采样
 * @param {number} rate - 采样率 (0-1)
 * @returns {boolean} 是否采样
 */
export function isSampled(rate: number): boolean {
  return Math.random() < rate;
}

/**
 * 安全的JSON序列化
 * @param {unknown} obj - 要序列化的对象
 * @returns {string} JSON字符串
 */
export function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    return String(obj);
  }
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = window.setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  let previous = 0;
  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - previous);
    if (remaining <= 0 || remaining > wait) {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(this, args);
    } else if (timeout === null) {
      timeout = window.setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * 获取元素的XPath路径
 * @param {Element} element - DOM元素
 * @returns {string} XPath路径
 */
export function getXPath(element: Element): string {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }
  if (element === document.body) {
    return '/html/body';
  }
  let ix = 0;
  const siblings = element.parentNode?.children;
  if (siblings) {
    for (let i = 0; i < siblings.length; i++) {
      const sibling = siblings[i];
      if (sibling === element) {
        const parentPath = element.parentNode
          ? getXPath(element.parentNode as Element)
          : '';
        return `${parentPath}/${element.tagName.toLowerCase()}[${ix + 1}]`;
      }
      if (sibling.tagName === element.tagName) {
        ix++;
      }
    }
  }
  return '';
}

/**
 * 获取元素的选择器
 * @param {Element} element - DOM元素
 * @returns {string} CSS选择器
 */
export function getSelector(element: Element): string {
  if (element.id) {
    return `#${element.id}`;
  }
  if (element.className) {
    const classes = element.className.split(' ').filter(Boolean);
    if (classes.length > 0) {
      return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
    }
  }
  return element.tagName.toLowerCase();
}

/**
 * 解析DSN
 * @param {string} dsn - 数据源名称
 * @returns {object} 解析后的DSN对象
 */
export function parseDSN(dsn: string): {
  url: string;
  projectId: string;
} {
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.split('/').filter(Boolean).pop() || '';
    return {
      url: dsn,
      projectId,
    };
  } catch (error) {
    console.error('[FireflyMonitor] Invalid DSN:', dsn);
    return {
      url: dsn,
      projectId: '',
    };
  }
}

/**
 * 获取错误堆栈信息
 * @param {Error} error - 错误对象
 * @returns {string} 堆栈信息
 */
export function getStackTrace(error: Error): string {
  return error.stack || '';
}

/**
 * 格式化字节大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
