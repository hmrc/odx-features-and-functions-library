import { AnalyticsConfig } from '../../src/analytics/analyticsConfig';

describe('AnalyticsConfig', () => {
  const mockUrl = 'https://example.com';
  const mockHeaders = { Authorization: 'Bearer token' };

  describe('Given a valid URL', () => {
    const config = new AnalyticsConfig(new URL(mockUrl));
    describe('When the URL is a string,', () => {
      it('Then it should set the URL correctly', () => {
        expect(config.url).toEqual(new URL(mockUrl));
        expect(config.headers).toBeUndefined();
        expect(config.logCallback).toBeUndefined();
      });

      it('And setting url to a new valid string, Then it should update the URL', () => {
        const newUrl = 'https://another.com';
        config.url = newUrl;
        expect(config.url).toEqual(new URL(newUrl));
      });
    });

    describe('When the URL is a URL Type,', () => {
      it('Then it should set the URL correctly', () => {
        expect(config.url).toEqual(new URL(mockUrl));
        expect(config.headers).toBeUndefined();
        expect(config.logCallback).toBeUndefined();
      });
    });
  });

  describe('Given a valid URL and headers', () => {
    const config = new AnalyticsConfig(mockUrl, mockHeaders)
    it('When an AnalyticsConfig is created, Then it should set the URL and headers correctly', () => {
      expect(config.url).toEqual(new URL(mockUrl));
      expect(config.headers).toEqual(mockHeaders);
      expect(config.logCallback).toBeUndefined();
    });

    it('When headers are updated after construction, Then it should reflect the new headers', () => {
      const newHeaders = { Foo: 'Bar' }
      config.headers = newHeaders;
      expect(config.headers).toEqual(newHeaders);
    });

  });

  describe('Given a valid URL, headers, and a log callback', () => {
    const logCallback = jest.fn();
    const config = new AnalyticsConfig(mockUrl, mockHeaders, logCallback);

    it('When an AnalyticsConfig is created, Then it should set all properties correctly', () => {
      expect(config.url).toEqual(new URL(mockUrl));
      expect(config.headers).toEqual(mockHeaders);
      expect(config.logCallback).toBe(logCallback);
    });

    it('When logCallback is updated after construction, Then it should reflect the new callback', () => {
      const newCallback = jest.fn();
      config.logCallback = newCallback;
      expect(config.logCallback).toBe(newCallback);
    });
  });

  describe('Given an invalid URL', () => {
    it('When an AnalyticsConfig is created, Then it should throw an error', () => {
      expect(() => new AnalyticsConfig('invalid-url')).toThrow(
        'Invalid URL provided'
      );
    });
    it('When setting url to an invalid value, Then it should throw an error', () => {
      const config = new AnalyticsConfig(mockUrl);
      expect(() => { config.url = 'not-a-url'; }).toThrow('Invalid URL provided');
    });
  });

  describe('Given no URL', () => {
    it('When an AnalyticsConfig is created, Then it should throw an error', () => {
      expect(() => new AnalyticsConfig('')).toThrow(
        'Invalid URL provided'
      );
    });

    it('When URL is set to undefined, Then URL should be undefined', () => {
      const config = new AnalyticsConfig('https://example.com');
      expect(config.url).toEqual(new URL('https://example.com'));
      config.url = undefined;
      expect(config.url).toBeUndefined();
    });
  });

  describe('Given an AnalyticsConfig with no URL', () => {
    it('When only apiCallback is provided, Then it should construct successfully', () => {
      const apiCallback = jest.fn();
      const config = new AnalyticsConfig(undefined, undefined, undefined, apiCallback);
      expect(config.apiCallback).toBe(apiCallback);
      expect(config.url).toBeUndefined();
    });

    it('When neither url nor apiCallback is provided, Then it should throw an error', () => {
      expect(() => new AnalyticsConfig(undefined, undefined, undefined, undefined)).toThrow(
        'AnalyticsConfig: You must provide either an apiCallback or a url (with optional headers).'
      );
    });
  });
});