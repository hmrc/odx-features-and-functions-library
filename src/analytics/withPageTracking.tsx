import React, { useEffect } from 'react'
import { AnalyticsPayload, EventType } from './analyticsPayload'
import { AnalyticsConfig } from './analyticsConfig'
import { useAnalyticsConfig } from './analyticsConfigContext'
import { LogLevel, logMessage } from '../helpers/logging'

/**
 * Higher-order component (HOC) to track page views.
 * @param WrappedComponent - The component to wrap.
 * @returns A new component that tracks page views.
 * @example
 * const MyComponentWithTracking = withPageTracking(MyComponent);
 */
interface WithPageTrackingProps {
  pageName?: string
  configOveride?: AnalyticsConfig
}

/**
 * Higher-order component (HOC) to track page views.
 * @param WrappedComponent - The component to wrap.
 * @returns A new component that tracks page views.
 * @example
 * const MyComponentWithTracking = withPageTracking(MyComponent);
 */
const withPageTracking = <P extends object>(WrappedComponent: React.ComponentType<P>): React.FC<P & WithPageTrackingProps> => {
  const HOC: React.FC<P & WithPageTrackingProps> = ({ pageName, configOveride, ...props }) => {
    const analyticsConfig = useAnalyticsConfig();

    useEffect(() => {
      const resolvedPageName =
        pageName ||
        WrappedComponent.displayName ||
        WrappedComponent.name ||
        'UnknownPage';

      const trackPageView = async (resolvedPageName: string) => {
        const effectiveConfig = configOveride || analyticsConfig;

        const logCallback = effectiveConfig?.logCallback;
        const apiCallback = effectiveConfig?.apiCallback;
        const targetUrl = effectiveConfig?.url?.toString();

        // Use headers from configOveride or analyticsConfig, defaulting to an empty object
        const headers = configOveride?.headers 
        || analyticsConfig?.headers
        || {};

        if (logCallback) {
          logMessage(
            `Sending tracking event: 'page view, ${resolvedPageName}'`,
            LogLevel.INFO,
            logCallback
          );
        }

        const payload = new AnalyticsPayload(EventType.Navigation, resolvedPageName);

        try {
          if (apiCallback) {
            await apiCallback(payload);
          } else if (targetUrl) {
            await fetch(targetUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify(payload)
            });
          } else {
            throw new Error('No apiCallback or url provided for analytics tracking.');
          }
        } catch (error) {
          logMessage(
            `Error sending tracking event: 'page view' to tracking API: ${error}`,
            LogLevel.ERROR,
            logCallback
          );
        }
      };

      trackPageView(resolvedPageName);
    }, [pageName, analyticsConfig, configOveride]);

    return <WrappedComponent {...(props as P)} />;
  };

  return HOC;
};

export default withPageTracking