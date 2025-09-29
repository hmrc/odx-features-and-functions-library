import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import withPageTracking from '../../src/analytics/withPageTracking';
import { AnalyticsConfigProvider } from '../../src/analytics/analyticsConfigContext';
import fetchMock from 'jest-fetch-mock';
import { AnalyticsConfig } from '../../src/analytics/analyticsConfig';
import { AnalyticsPayload, EventType } from '../../src/analytics/analyticsPayload';
import { logMessage, LogLevel } from '../../src/helpers/logging';

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

describe('withPageTracking', () => {
  const TestComponent: React.FC = () => <div data-testid="wrapped-component">Test Component</div>;
  const TrackedComponent = withPageTracking(TestComponent);

  const mockUrl = 'https://example.com/track';
  const mockHeaders = { Authorization: 'Bearer token' };
  const mockBody = JSON.stringify({ EventType: EventType.Navigation, Target: 'TestPage' });

  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
  });

  describe('Given a valid AnalyticsConfigProvider', () => {
    it('When the component is rendered, Then it should send a page view event', async () => {
      render(
        <AnalyticsConfigProvider url={mockUrl} headers={mockHeaders}>
          <TrackedComponent pageName="TestPage" />
        </AnalyticsConfigProvider>
      );

      expect(fetchMock).toHaveBeenCalledWith(mockUrl, {
        method: 'POST',
        headers: mockHeaders,
        body: mockBody,
      });
    });

    describe('When pageName is not provided', () => { })
    it('Then it should use the wrapped component name as Target', async () => {
      const TestComponent: React.FC = () => <div data-testid="wrapped-component">Test Component</div>;
      const TrackedComponent = withPageTracking(TestComponent);

      render(
        <AnalyticsConfigProvider url={mockUrl} headers={mockHeaders}>
          <TrackedComponent />
        </AnalyticsConfigProvider>
      );

      expect(fetchMock).toHaveBeenCalledWith(
        mockUrl,
        expect.objectContaining({
          method: 'POST',
          headers: mockHeaders,
          body: JSON.stringify({ EventType: EventType.Navigation, Target: 'TestComponent' }),
        })
      );
    });

    it('And component name is missing, Then it should use "UnknownPage" as Target', async () => {
      const TrackedComponent = withPageTracking(() => <div data-testid="anon">Anon</div>);

      render(
        <AnalyticsConfigProvider url={mockUrl} headers={mockHeaders}>
          <TrackedComponent />
        </AnalyticsConfigProvider>
      );

      expect(fetchMock).toHaveBeenCalledWith(
        mockUrl,
        expect.objectContaining({
          method: 'POST',
          headers: mockHeaders,
          body: JSON.stringify({ EventType: EventType.Navigation, Target: 'UnknownPage' }),
        })
      );
    });
  });

  describe('Given no target URL is provided', () => {
    describe('When the component is rendered', () => {
      it('Then it should error', () => {
        expect(() => {
          render(<TrackedComponent pageName="TestPage" />);
        }).toThrow();
      });

      it('Then it should not attempt to fetch', () => {
        expect(() => {
          render(<TrackedComponent pageName="TestPage" />);
        }).toThrow();

        expect(global.fetch).not.toHaveBeenCalled();
      })
    });
  });

  describe('Given no header provided', () => {
    describe('When the component is rendered', () => {
      it('Then it should use an empty object for headers in the fetch call', () => {
        render(
          <AnalyticsConfigProvider url={mockUrl}>
            <TrackedComponent pageName="TestPage" />
          </AnalyticsConfigProvider>
        );

        expect(fetchMock).toHaveBeenCalledWith(
          mockUrl,
          expect.objectContaining({
            method: 'POST',
            body: mockBody,
            headers: {},
          })
        );
      })
    });
  });

  describe('Given a config override is provided', () => {
    const mockUrlOverride = 'https://override.com/track';
    const mockHeadersOverride = { Authorization: 'Bearer override-token' };
    const mockLogCallback = jest.fn();

    describe('When the component is rendered', () => {
      it('Then it should use the override configuration', async () => {
        render(
          <AnalyticsConfigProvider url={mockUrl} headers={mockHeaders}>
            <TrackedComponent
              pageName="TestPage"
              configOveride={
                new AnalyticsConfig(mockUrlOverride, mockHeadersOverride, mockLogCallback)}
            />
          </AnalyticsConfigProvider>
        );

        expect(fetchMock).toHaveBeenCalledWith(
          mockUrlOverride, //new URL(mockUrlOverride),
          expect.objectContaining({
            method: 'POST',
            body: mockBody,
            headers: expect.objectContaining(mockHeadersOverride),
          })
        );
      });

      describe('And configOveride.headers is not provided', () => {
        it('Then it should use analyticsConfig.headers for the fetch call', async () => {
          const configOverride = new AnalyticsConfig(
            'https://override.com/track',
            undefined
          );

          render(
            <AnalyticsConfigProvider url={mockUrl} headers={mockHeaders}>
              <TrackedComponent pageName="TestPage" configOveride={configOverride} />
            </AnalyticsConfigProvider>
          );

          const test = fetchMock.mock.calls[0][1];

          expect(fetchMock).toHaveBeenCalledWith(
            mockUrlOverride,
            expect.objectContaining({
              method: 'POST',
              body: mockBody,
              headers: expect.objectContaining(mockHeaders),
            })
          );
        });
      });
    });
  });

  describe('Given apiCallback is to be used', () => {
    it('When apiCallback is provided in config, Then it should call apiCallback with the correct payload', async () => {
      const apiCallback = jest.fn().mockResolvedValue(undefined);

      const TestComponent: React.FC = () => <div data-testid="tracked">Tracked</div>;
      const TrackedComponent = withPageTracking(TestComponent);

      render(
        <AnalyticsConfigProvider apiCallback={apiCallback}>
          <TrackedComponent pageName="ApiCallbackPage" />
        </AnalyticsConfigProvider>
      );

      // Wait for useEffect to run
      await waitFor(() => {
        expect(apiCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            EventType: EventType.Navigation,
            Target: 'ApiCallbackPage'
          })
        );
      });
    });

    it('When both apiCallback and url are provided, Then it should prefer apiCallback', async () => {
      const apiCallback = jest.fn().mockResolvedValue(undefined);

      const TestComponent: React.FC = () => <div data-testid="tracked">Tracked</div>;
      const TrackedComponent = withPageTracking(TestComponent);

      render(
        <AnalyticsConfigProvider url={'https://example.com/track'} apiCallback={apiCallback}>
          <TrackedComponent pageName="ApiCallbackPreferred" />
        </AnalyticsConfigProvider>
      );

      await waitFor(() => {
        expect(apiCallback).toHaveBeenCalled();
        expect(fetchMock).not.toHaveBeenCalled();
      });
    });

    describe('When neither url nor apiCallback is provided', () => {
      it('Then it should throw an error', () => {
        const TestComponent: React.FC = () => <div />;
        const TrackedComponent = withPageTracking(TestComponent);

        expect(() => {
          render(
            <AnalyticsConfigProvider>
              <TrackedComponent pageName="NoConfig" />
            </AnalyticsConfigProvider>
          );
        }).toThrow('AnalyticsConfig: You must provide either an apiCallback or a url (with optional headers).');
      });
    });
  });
});