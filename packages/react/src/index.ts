import { Component, ReactNode, ErrorInfo } from 'react';
import { BrowserMonitor } from '@firefly-monitor/browser';
import { MonitorConfig } from '@firefly-monitor/shared';

export interface ErrorBoundaryProps {
  monitor: BrowserMonitor;
  fallback?: ReactNode;
  children: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class MonitorErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.monitor.track('react-error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}

export { BrowserMonitor };
export * from '@firefly-monitor/browser';
