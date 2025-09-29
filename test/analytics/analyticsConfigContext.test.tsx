import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { AnalyticsConfigProvider, useAnalyticsConfig } from '../../src/analytics/analyticsConfigContext';

// Capture props passed to the mocked ErrorBoundary
const mockErrorBoundaryProps: any = {};
jest.mock('../../src/helpers/errorBoundary', () => ({
  ErrorBoundary: (props: any) => {
    Object.assign(mockErrorBoundaryProps, props);
    return <>{props.children}</>;
  },
}));

describe('AnalyticsConfigContext', () => {
  const TestComponent: React.FC = () => {
    const config = useAnalyticsConfig();
    return (
      <div>
        <p data-testid="url">{config.url?.toString()}</p>
        <p data-testid="headers">{JSON.stringify(config.headers)}</p>
        <p data-testid="logCallback">{typeof config.logCallback}</p>
        <p data-testid="apiCallback">{typeof config.apiCallback}</p>
      </div>
    );
  };

  describe('Given a valid configuration', () => {
    it('When the provider wraps a component, Then the configuration should be accessible via the context', () => {
      const url = 'https://example.com';
      const headers = { Authorization: 'Bearer token' };
      const logCallback = jest.fn();

      render(
        <AnalyticsConfigProvider url={url} headers={headers} logCallback={logCallback}>
          <TestComponent />
        </AnalyticsConfigProvider>
      );

      expect(screen.getByTestId('url').textContent).toContain(url);
      expect(screen.getByTestId('headers').textContent).toBe(JSON.stringify(headers));
      expect(screen.getByTestId('logCallback').textContent).toBe('function');
    });

    it('When the provider is given only an apiCallback, Then the configuration should include the apiCallback and not the URL', () => {
      const apiCallback = jest.fn();

      render(
        <AnalyticsConfigProvider apiCallback={apiCallback}>
          <TestComponent />
        </AnalyticsConfigProvider>
      );

      expect(screen.getByTestId('url').textContent).toBeFalsy();
      expect(screen.getByTestId('apiCallback').textContent).toBe('function');
    });

    it('When neither url nor apiCallback is provided, Then the provider should throw an error', () => {
      // Suppress expected React error output for this test
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      const InvalidProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <AnalyticsConfigProvider>
          {children}
        </AnalyticsConfigProvider>
      );

      expect(() =>
        render(
          <InvalidProvider>
            <div>Child</div>
          </InvalidProvider>
        )
      ).toThrow(
        'AnalyticsConfig: You must provide either an apiCallback or a url (with optional headers).'
      );

      errorSpy.mockRestore();
    });

    describe('when an error occurs in a child', () => {
      it('should call logCallback and console.error via the ErrorBoundary onError prop', () => {
        const logCallback = jest.fn();
        const error = new Error('Test error');
        const info = { componentStack: 'stack' };
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        render(
          <AnalyticsConfigProvider url="https://example.com" logCallback={logCallback}>
            <div>Child</div>
          </AnalyticsConfigProvider>
        );

        // Simulate the error boundary catching an error
        mockErrorBoundaryProps.onError(error, info);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'AnalyticsConfigProvider error:',
          error,
          info
        );
        expect(logCallback).toHaveBeenCalledWith('Test error');

        consoleErrorSpy.mockRestore();
      });

      it('should render children via fallbackRender', () => {
        render(
          <AnalyticsConfigProvider url="https://example.com">
            <div data-testid="child">Child</div>
          </AnalyticsConfigProvider>
        );

        // fallbackRender should return children
        const fallback = mockErrorBoundaryProps.fallbackRender();
        // fallback is a React fragment with children, so we can check its type
        expect(fallback.props.children.props['data-testid']).toBe('child');
      });
    });

  });

  describe('Given the hook is used outside of the provider', () => {
    it('When the hook is called, Then it should throw an error', () => {
      // Suppress expected React error output for this test
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      const InvalidComponent: React.FC = () => {
        useAnalyticsConfig();
        return <div />;
      };

      expect(() => render(<InvalidComponent />)).toThrow(
        'useAnalyticsConfig must be used within an AnalyticsConfigProvider'
      );

      errorSpy.mockRestore();
    });
  });

  describe('Given a provider with no optional props', () => {
    it('When the provider wraps a component, Then the configuration should have default values for optional props', () => {
      const url = 'https://example.com';

      render(
        <AnalyticsConfigProvider url={url}>
          <TestComponent />
        </AnalyticsConfigProvider>
      );

      expect(screen.getByTestId('url').textContent).toContain(url);
      expect(screen.getByTestId('headers').textContent).toBe('');
      expect(screen.getByTestId('logCallback').textContent).toBe('undefined');
    });
  });
});