import React, { createContext, useContext, useMemo } from 'react'
import { ErrorBoundary } from '../helpers/errorBoundary';
import { AnalyticsConfig } from './analyticsConfig'
import { AnalyticsPayload } from './analyticsPayload';

/**
 * @interface AnalyticsConfigProviderProps
 * @description Props for the `AnalyticsConfigProvider` component.
 * @property {string} url - The base URL for the analytics configuration.
 * @property {Record<string, string>} [headers] - Optional headers to include in the analytics configuration.
 * @property {(message: string) => void} [logCallback] - Optional callback function for logging messages.
 * @property {React.ReactNode} children - The child components to be wrapped by the provider.
 */
export interface AnalyticsConfigProviderProps {
  url?: string
  headers?: Record<string, string>
  logCallback?: (message: string) => void
  apiCallback?: (payload: AnalyticsPayload) => Promise<void>
  children: React.ReactNode
}

/**
 * @constant AnalyticsConfigContext
 * @description React context for providing an `AnalyticsConfig` instance.
 * Initialized with a default value of `null`.
 */
const AnalyticsConfigContext = createContext<AnalyticsConfig | null>(null)

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
export const AnalyticsConfigProvider: React.FC<AnalyticsConfigProviderProps> = ({
  url,
  headers,
  logCallback,
  apiCallback,
  children
}) => {

  // Create a new instance of AnalyticsConfig for this provider
  const analyticsConfig = useMemo(() => new AnalyticsConfig(url, headers, logCallback, apiCallback), [
    url,
    headers,
    logCallback,
    apiCallback
  ])

  return (
    <ErrorBoundary
      fallbackRender={() => {
        // render children so as to not break client code UI
        return <>{children}</>;
      }}
      onError={(error, info) => {
        console.error('AnalyticsConfigProvider error:', error, info);
        if (logCallback) logCallback(error.message);
      }}
    >
      <AnalyticsConfigContext.Provider value={analyticsConfig}>
        {children}
      </AnalyticsConfigContext.Provider>
    </ErrorBoundary>
  )
}

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
 *  import { AnalyticsConfigProvider } from './Analytics/AnalyticsConfigContext';
 *  import YourComponent from './YourComponent';
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
 *  import { useAnalyticsConfig } from './Analytics/AnalyticsConfigContext';
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
export const useAnalyticsConfig = (): AnalyticsConfig => {
  const context = useContext(AnalyticsConfigContext)
  if (context == null) {
    throw new Error('useAnalyticsConfig must be used within an AnalyticsConfigProvider')
  }
  return context
}