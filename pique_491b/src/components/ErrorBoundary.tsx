import { ErrorFallback } from '@/components/ErrorFallback';
import React from 'react';

type Props = {
  children: React.ReactNode;
  onReset?: () => void;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught an error:', error);
    }
  }

  private retry = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.retry}
          onGoHome={this.retry}
        />
      );
    }
    return this.props.children;
  }
}
