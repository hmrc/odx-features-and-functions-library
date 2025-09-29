import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AnalyticsConfigProvider, useAnalyticsConfig } from '../../src/analytics/analyticsConfigContext';
import withPageTracking from '../../src/analytics/withPageTracking';
import fetchMock from 'jest-fetch-mock';
import { EventType } from '../../src/analytics/analyticsPayload';

jest.mock('../../src/helpers/logging', () => ({
  logMessage: jest.fn(),
  LogLevel: {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG'
  }
}));

fetchMock.enableMocks();

describe('Analytics Integration', () => {
  const mockUrl = 'https://example.com/track';
  const mockHeaders = { Authorization: 'Bearer token' };

  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
  });

  describe('Given an AnalyticsConfigProvider', () => {
    describe('When a child uses useAnalyticsConfig', () => {
      it('Then the child should receive the correct config values', () => {
        const TestComponent: React.FC = () => {
          const config = useAnalyticsConfig();
          return (
            <div>
              <span data-testid="url">{config.url?.toString()}</span>
              <span data-testid="headers">{JSON.stringify(config.headers)}</span>
            </div>
          );
        };

        render(
          <AnalyticsConfigProvider url={mockUrl} headers={mockHeaders}>
            <TestComponent />
          </AnalyticsConfigProvider>
        );

        expect(screen.getByTestId('url').textContent).toBe(mockUrl);
        expect(screen.getByTestId('headers').textContent).toBe(JSON.stringify(mockHeaders));
      });
    });

    describe('When a child uses useAnalyticsConfig outside the provider', () => {
      it('Then it should throw an error', () => {
        const TestComponent: React.FC = () => {
          useAnalyticsConfig();
          return <div />;
        };
        expect(() => render(<TestComponent />)).toThrow(
          'useAnalyticsConfig must be used within an AnalyticsConfigProvider'
        );
      });
    });

    describe('When a component wrapped with withPageTracking is rendered', () => {
      it('Then it should send a page view event with correct payload and headers', async () => {
        const TestComponent: React.FC = () => <div data-testid="tracked">Tracked</div>;
        const Tracked = withPageTracking(TestComponent);

        render(
          <AnalyticsConfigProvider url={mockUrl} headers={mockHeaders}>
            <Tracked pageName="IntegrationPage" />
          </AnalyticsConfigProvider>
        );

        await waitFor(() => {
          expect(fetchMock).toHaveBeenCalledWith(
            mockUrl,
            expect.objectContaining({
              method: 'POST',
              headers: mockHeaders,
              body: JSON.stringify({ EventType: EventType.Navigation, Target: 'IntegrationPage' })
            })
          );
        });
        expect(screen.getByTestId('tracked')).toBeTruthy();
      });

      it('Then it should use config override if provided', async () => {
        const TestComponent: React.FC = () => <div data-testid="tracked-override">TrackedOverride</div>;
        const Tracked = withPageTracking(TestComponent);
        const overrideUrl = new URL('https://override.com/track');
        const overrideHeaders = { Authorization: 'Bearer override-token' };
        const { AnalyticsConfig } = await import('../../src/analytics/analyticsConfig');
        const configOverride = new AnalyticsConfig(overrideUrl, overrideHeaders);

        render(
          <AnalyticsConfigProvider url={mockUrl} headers={mockHeaders}>
            <Tracked pageName="OverridePage" configOveride={configOverride} />
          </AnalyticsConfigProvider>
        );

        await waitFor(() => {
          expect(fetchMock).toHaveBeenCalledWith(
            overrideUrl.toString(),
            expect.objectContaining({
              method: 'POST',
              headers: overrideHeaders,
              body: JSON.stringify({ EventType: EventType.Navigation, Target: 'OverridePage' })
            })
          );
        });
        expect(screen.getByTestId('tracked-override')).toBeTruthy();
      });

      it('Then it should use empty headers if none provided', async () => {
        const TestComponent: React.FC = () => <div data-testid="tracked-no-headers">TrackedNoHeaders</div>;
        const Tracked = withPageTracking(TestComponent);

        render(
          <AnalyticsConfigProvider url={mockUrl}>
            <Tracked pageName="NoHeadersPage" />
          </AnalyticsConfigProvider>
        );

        await waitFor(() => {
          expect(fetchMock).toHaveBeenCalledWith(
            mockUrl,
            expect.objectContaining({
              method: 'POST',
              headers: {},
              body: JSON.stringify({ EventType: EventType.Navigation, Target: 'NoHeadersPage' })
            })
          );
        });
        expect(screen.getByTestId('tracked-no-headers')).toBeTruthy();
      });

      it('Then it should call apiCallback if provided and not call fetch', async () => {
        const apiCallback = jest.fn().mockResolvedValue(undefined);
        const TestComponent: React.FC = () => <div data-testid="tracked-api-callback">TrackedApiCallback</div>;
        const Tracked = withPageTracking(TestComponent);

        render(
          <AnalyticsConfigProvider apiCallback={apiCallback}>
            <Tracked pageName="ApiCallbackPage" />
          </AnalyticsConfigProvider>
        );

        await waitFor(() => {
          expect(apiCallback).toHaveBeenCalledWith(
            expect.objectContaining({
              EventType: EventType.Navigation,
              Target: 'ApiCallbackPage'
            })
          );
          expect(fetchMock).not.toHaveBeenCalled();
        });
        expect(screen.getByTestId('tracked-api-callback')).toBeTruthy();
      });

      it('Then it should throw if neither url nor apiCallback is provided', () => {
        const TestComponent: React.FC = () => <div />;
        const Tracked = withPageTracking(TestComponent);

        // Suppress expected error output
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        expect(() =>
          render(
            <AnalyticsConfigProvider>
              <Tracked pageName="NoConfigPage" />
            </AnalyticsConfigProvider>
          )
        ).toThrow(
          'AnalyticsConfig: You must provide either an apiCallback or a url (with optional headers).'
        );

        errorSpy.mockRestore();
      });
    });
  });
});