
/**
 * A React error boundary component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 *
 * @remarks
 * Use this component to gracefully handle runtime errors in React components and prevent the entire app from crashing.
 *
 * This component is next expected to be used out side of this library.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary fallbackRender={(error, info) => <div>Something went wrong!</div>}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 *
 * @param children - The child components to render inside the error boundary.
 * @param fallbackRender - Optional. A render function that receives the error and error info, and returns a fallback UI.
 * @param onError - Optional. A callback function that is called when an error is caught.
 *
 * @see [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)
 */
import React from 'react';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackRender?: (error: Error, info: React.ErrorInfo) => React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, info: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ hasError: true, error, info });
    if (this.props.onError) {
      this.props.onError(error, info);
    }
    // Always log to console for visibility
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError && this.props.fallbackRender) {
      return this.props.fallbackRender(this.state.error!, this.state.info!);
    }

    return this.props.children;
  }
}