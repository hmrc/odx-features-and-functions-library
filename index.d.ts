declare module 'hmrc-odx-features-and-functions/analytics/analyticsConfig' {
  import { LoggingCallback } from 'hmrc-odx-features-and-functions/helpers/logging';
  export interface HttpHeaders {
      [key: string]: string;
  }
  /**
   * Represents the configuration for analytics.
   * This class is used to encapsulate the URL, headers, and logging callback
   * for sending analytics data.
   */
  export class AnalyticsConfig {
      private _url;
      /**
       * The URL for the analytics configuration.
       * This is a required property.
       */
      get url(): URL;
      /**
       * Sets the URL for the analytics configuration.
       * @param value - The URL as a string or URL object.
       * @throws Will throw an error if the provided URL is invalid.
       */
      set url(value: string | URL);
      /**
       * The headers to include in the analytics configuration.
       * This is an optional property.
       */
      headers?: HttpHeaders;
      /**
       * The callback function for logging messages.
       * This is an optional property.
       */
      logCallback?: LoggingCallback;
      /**
       * Constructs an instance of the AnalyticsConfig class.
       * @param url - The URL for the analytics configuration.
       * @param headers - Optional headers to include in the analytics configuration.
       * @param logCallback - Optional callback function for logging messages.
       */
      constructor(url: string | URL, headers?: HttpHeaders, logCallback?: LoggingCallback);
  }

}
declare module 'hmrc-odx-features-and-functions/analytics/analyticsConfigContext' {
  import React from 'react';
  import { AnalyticsConfig } from 'hmrc-odx-features-and-functions/analytics/analyticsConfig';
  /**
   * @interface AnalyticsConfigProviderProps
   * @description Props for the `AnalyticsConfigProvider` component.
   * @property {string} url - The base URL for the analytics configuration.
   * @property {Record<string, string>} [headers] - Optional headers to include in the analytics configuration.
   * @property {(message: string) => void} [logCallback] - Optional callback function for logging messages.
   * @property {React.ReactNode} children - The child components to be wrapped by the provider.
   */
  export interface AnalyticsConfigProviderProps {
      url: string;
      headers?: Record<string, string>;
      logCallback?: (message: string) => void;
      children: React.ReactNode;
  }
  /**
   * @component AnalyticsConfigProvider
   * @description A provider component that creates and provides an `AnalyticsConfig` instance to its children.
   * @param {AnalyticsConfigProviderProps} props - The props for the provider.
   * @returns {React.ReactElement} The provider component wrapping its children.
   * @example
   * <AnalyticsConfigProvider
   *   url="https://example.com/api"
   *   headers={{ Authorization: 'Bearer token' }}
   *   logCallback={(message) => console.log('Log:', message)}
   * >
   *   <YourComponent />
   * </AnalyticsConfigProvider>
   */
  export const AnalyticsConfigProvider: React.FC<AnalyticsConfigProviderProps>;
  /**
   * @function useAnalyticsConfig
   * @description A custom hook to access the `AnalyticsConfig` instance from the context.
   * @throws {Error} Throws an error if the hook is used outside of an `AnalyticsConfigProvider`.
   * @returns {AnalyticsConfig} The `AnalyticsConfig` instance provided by the context.
   * @example
   * const analyticsConfig = useAnalyticsConfig();
   * analyticsConfig.log('Event logged!');
   *
   * Full example usage:
   * //Wrap your application or component tree with the AnalyticsConfigProvider and pass the required props.
   *
   *  import React from 'react';
   *  import { AnalyticsConfigProvider } from 'hmrc-odx-features-and-functions/analytics/Analytics/AnalyticsConfigContext/index';
   *  import YourComponent from 'hmrc-odx-features-and-functions/analytics/YourComponent/index';
   *
   *  const App: React.FC = () => {
   *    return (
   *      <AnalyticsConfigProvider
   *        url="https://example.com/api"
   *        headers={{ Authorization: 'Bearer token' }}
   *        logCallback={(message) => console.log('Log:', message)}
   *      >
   *        <YourComponent />
   *      </AnalyticsConfigProvider>
   *    );
   *  };
   *
   *  export default App;
   *
   *  //Then, in any child component, you can use the useAnalyticsConfig hook to access the AnalyticsConfig instance:
   *  import React from 'react';
   *  import { useAnalyticsConfig } from 'hmrc-odx-features-and-functions/analytics/Analytics/AnalyticsConfigContext/index';
   *
   *  const YourComponent: React.FC = () => {
   *    const analyticsConfig = useAnalyticsConfig();
   *
   *    const handleClick = () => {
   *      analyticsConfig.log('Button clicked!');
   *    };
   *
   *    return (
   *      <div>
   *        <h1>Analytics Config Example</h1>
   *        <button onClick={handleClick}>Log Event</button>
   *      </div>
   *    );
   *  };
   *
   *  export default YourComponent;
   *
   */
  export const useAnalyticsConfig: () => AnalyticsConfig;

}
declare module 'hmrc-odx-features-and-functions/analytics/analyticsPayload' {
  /**
   * Represents the payload for analytics data.
   * This class is used to encapsulate information about a specific analytics event,
   * including the target of the event, any associated error messages, and additional
   * payload data in a JSON-compatible format.
   */
  export enum EventType {
      Navigation = "Navigation",
      Link = "Link",
      Error = "Error",
      UserInput = "UserInput",
      Other = "Other"
  }
  export class AnalyticsPayload {
      EventType: EventType;
      Target: string;
      ErrorMessage?: string;
      AdditionalPayload?: Record<string, any>;
      /**
       * Constructs an instance of the AnalyticsPayload class.
       * @param {EventType} eventType - The type of the analytics event.
       * @param {string} target - The target of the analytics event.
       * @param {string} [errorMessage] - An optional error message associated with the event.
       * @param {Record<string, any>} [additionalPayload] - An optional additional payload in JSON-compatible format.
       */
      constructor(eventType: EventType, target: string, errorMessage?: string, additionalPayload?: Record<string, any>);
  }

}
declare module 'hmrc-odx-features-and-functions/analytics/index' {
  import { AnalyticsConfig, HttpHeaders } from 'hmrc-odx-features-and-functions/analytics/analyticsConfig';
  import { AnalyticsConfigProviderProps, AnalyticsConfigProvider, useAnalyticsConfig } from 'hmrc-odx-features-and-functions/analytics/analyticsConfigContext';
  import { AnalyticsPayload, EventType } from 'hmrc-odx-features-and-functions/analytics/analyticsPayload';
  import withPageTracking from 'hmrc-odx-features-and-functions/analytics/withPageTracking';
  export { AnalyticsConfig, HttpHeaders, AnalyticsConfigProviderProps, AnalyticsConfigProvider, useAnalyticsConfig, AnalyticsPayload, EventType, withPageTracking };

}
declare module 'hmrc-odx-features-and-functions/analytics/withPageTracking' {
  import React from 'react';
  import { AnalyticsConfig } from 'hmrc-odx-features-and-functions/analytics/analyticsConfig';
  /**
   * Higher-order component (HOC) to track page views.
   * @param WrappedComponent - The component to wrap.
   * @returns A new component that tracks page views.
   * @example
   * const MyComponentWithTracking = withPageTracking(MyComponent);
   */
  interface WithPageTrackingProps {
      pageName: string;
      configOveride?: AnalyticsConfig;
  }
  /**
   * Higher-order component (HOC) to track page views.
   * @param WrappedComponent - The component to wrap.
   * @returns A new component that tracks page views.
   * @example
   * const MyComponentWithTracking = withPageTracking(MyComponent);
   */
  const withPageTracking: <P extends object>(WrappedComponent: React.ComponentType<P>) => React.FC<P & WithPageTrackingProps>;
  export default withPageTracking;

}
declare module 'hmrc-odx-features-and-functions/helpers/errorBoundary' {
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
      constructor(props: ErrorBoundaryProps);
      static getDerivedStateFromError(error: Error): {
          hasError: boolean;
          error: Error;
          info: null;
      };
      componentDidCatch(error: Error, info: React.ErrorInfo): void;
      render(): React.ReactNode;
  }

}
declare module 'hmrc-odx-features-and-functions/helpers/index' {
  import { ErrorBoundary } from "hmrc-odx-features-and-functions/helpers/errorBoundary";
  import { LoggingCallback, LogLevel, logMessage } from "hmrc-odx-features-and-functions/helpers/logging";
  export { ErrorBoundary, LoggingCallback, LogLevel, logMessage };

}
declare module 'hmrc-odx-features-and-functions/helpers/logging' {
  export enum LogLevel {
      DEBUG = "debug",
      INFO = "info",
      WARN = "warn",
      ERROR = "error"
  }
  /**
   * @function logMessage
   * @description Logs a message to the console and a provided loggging callback with a specified log level.
   * @param {string} message - The message to log.
   * @param {LogLevel} [level=LogLevel.DEBUG] - The log level (default is LogLevel.DEBUG).
   * @param {LoggingCallback} [logCallback] - Optional callback function for custom logging behavior.
   */
  export type LoggingCallback = (message: string, level: LogLevel) => void;
  /**
   * @function logMessage
   * @description Logs a message to the console and a provided loggging callback with a specified log level.
   * @param {string} message - The message to log.
   * @param {LogLevel} [level=LogLevel.DEBUG] - The log level (default is LogLevel.DEBUG).
   * @param {LoggingCallback} [logCallback] - Optional callback function for custom logging behavior.
   * @returns {void}
   * @throws {Error} Throws an error if the log level is invalid
   * @example
   * logMessage('This is a debug message', LogLevel.DEBUG);
   */
  export function logMessage(message: string, level?: LogLevel, logCallback?: LoggingCallback): void;

}
declare module 'hmrc-odx-features-and-functions/index' {
  import { AnalyticsConfig, HttpHeaders, AnalyticsConfigProviderProps, AnalyticsConfigProvider, useAnalyticsConfig, AnalyticsPayload, EventType, withPageTracking } from 'hmrc-odx-features-and-functions/analytics/index';
  import { ErrorBoundary, LoggingCallback, LogLevel, logMessage } from 'hmrc-odx-features-and-functions/helpers/index';
  export { AnalyticsConfig, HttpHeaders, AnalyticsConfigProviderProps, AnalyticsConfigProvider, useAnalyticsConfig, AnalyticsPayload, EventType, withPageTracking, ErrorBoundary, LoggingCallback, LogLevel, logMessage };

}
declare module 'hmrc-odx-features-and-functions' {
  import main = require('hmrc-odx-features-and-functions/main');
  export = main;
}