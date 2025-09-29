import InteractionTracker, { EventDetails, TrackerConfig } from '../../src/analytics/interactionTracker';
import { EventType } from '../../src/analytics';
import { logMessage, LogLevel } from '../../src/helpers/logging';
import { createElementWithClass, createElementForSelector } from '../../src/helpers/utils';

jest.mock('../../src/helpers/logging', () => ({
  logMessage: jest.fn(),
  LogLevel: {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG'
  }
}));

const defaultEvent1 = 'click';
const defaultEvent2 = 'change';
const defaultTestEventType = EventType.Navigation;
const testEventTarget = 'Event Target Value'
const mockUrl = 'https://test.com';

const createTrackerConfig = (overrides: Partial<TrackerConfig> = {}): TrackerConfig => {
  return {
    ...overrides
  } as TrackerConfig;
};

const setupInteractionTracker = (configOverrides: Partial<TrackerConfig> = {}): InteractionTracker => {
  const config = createTrackerConfig(configOverrides);
  const trackerInstance = new InteractionTracker(config);

  jest.spyOn(trackerInstance, 'logEvent').mockImplementation(
    async (_type: string, _target: HTMLElement, _value: string | null = null) => { }
  );

  trackerInstance.startEventTracking();
  return trackerInstance;
}

describe('Given InteractionTracker is created', () => {
  let tracker: InteractionTracker;
  let mockConfig: TrackerConfig;

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('Then trackerConfig should return the provided configuration', () => {
    mockConfig = createTrackerConfig({ url: new URL(mockUrl) });
    tracker = setupInteractionTracker(mockConfig);
    expect(tracker.trackerConfig).toStrictEqual(mockConfig);
  });

  describe('When startEventTracking is called', () => {
    let el: HTMLElement;
    let clickEvent: Event;
    let changeEvent: Event;

    const defaultIncludedSelectors = ['button', 'a', 'select', 'input'];

    beforeEach(() => {
      clickEvent = new Event(defaultEvent1, { bubbles: true });
      changeEvent = new Event(defaultEvent2, { bubbles: true });

      el = document.createElement('button');
      el.className = 'class-name';
      el.id = 'id-name';
      document.body.appendChild(el);
    });

    it('Then it should register event listeners for "click" and "change" by default', () => {
      const spy = jest.spyOn(document, 'addEventListener');
      tracker = setupInteractionTracker({ url: new URL(mockUrl) });

      expect(spy).toHaveBeenCalledWith(defaultEvent1, expect.any(Function), true);
      expect(spy).toHaveBeenCalledWith(defaultEvent2, expect.any(Function), true);
    });

    it('Then it should register custom event listeners if provided as overrides', () => {
      const spy = jest.spyOn(document, 'addEventListener');
      const customEvents = ['focus', 'blur'];

      tracker = setupInteractionTracker({ url: new URL(mockUrl), events: customEvents });

      expect(spy).toHaveBeenCalledWith(customEvents[0], expect.any(Function), true);
      expect(spy).toHaveBeenCalledWith(customEvents[1], expect.any(Function), true);
    });

    describe.each(defaultIncludedSelectors)('And no override includeSelectors are provided, %s', (selector) => {
      it('Then should be tracked as default', () => {
        tracker = setupInteractionTracker({ url: new URL(mockUrl) });
        const el = createElementForSelector(selector);

        el.dispatchEvent(clickEvent);

        expect(tracker.logEvent).toHaveBeenCalledWith(defaultTestEventType, defaultEvent1, {});
      });
    });

    describe.each([
      { config: { includeSelectors: ['button', '.class-name', '#id-name'] }, description: 'valid tag, class and ID includeSelectors that exist in the DOM' },
      { config: { includeSelectors: ['button'] }, description: 'a valid tag includeSelector that exists in the DOM' },
      { config: { includeSelectors: ['.class-name'] }, description: 'a valid class includeSelector that exist in the DOM' },
      { config: { includeSelectors: ['#id-name'] }, description: 'a valid ID includeSelector that exists in the DOM' },
    ])('And it receives $description', ({ config }) => {

      beforeEach(() => {
        tracker = setupInteractionTracker({ url: new URL(mockUrl), ...config })
      });

      it('Then it should log an event for the selector', () => {
        el.dispatchEvent(clickEvent);

        expect(tracker.logEvent).toHaveBeenCalledWith(defaultTestEventType, defaultEvent1, {});
      });
    });

    describe.each([
      { config: { excludeSelectors: ['button', '.class-name', '#id-name'] }, description: 'valid tag, class and ID excludeSelectors that exist in the DOM' },
      { config: { excludeSelectors: ['button'] }, description: 'a valid tag excludeSelector that exists in the DOM' },
      { config: { excludeSelectors: ['.class-name'] }, description: 'a valid class excludeSelector that exist in the DOM' },
      { config: { excludeSelectors: ['#id-name'] }, description: 'a valid ID excludeSelector that exists in the DOM' },
      { config: { includeSelectors: ['#id-not-in-DOM', '.class-not-in-DOM'] }, description: 'valid includeSelectors that do not exist in the DOM' },
    ])('And it receives $description', ({ config }) => {

      beforeEach(() => {
        tracker = setupInteractionTracker({ url: new URL(mockUrl), ...config })
      });

      it('Then it should not log an event for the selector', () => {
        el.dispatchEvent(clickEvent);

        expect(tracker.logEvent).not.toHaveBeenCalled();
      });
    });

    describe.each([
      { config: { includeSelectors: ['button', '.class-name', '##invalid-tag', 'input >'] }, description: 'invalid and valid selectors in includeSelectors (valid first)' },
      { config: { includeSelectors: ['section:', 'button', '#id-name', '11invalid'] }, description: 'invalid and valid selectors in includeSelectors (invalid first)' },
      { config: { includeSelectors: ['button', '.class-name', 'select', '.btn-primary'], excludeSelectors: ['[', '##invalid', null as any, 'input >'] }, description: 'valid selectors in includeSelectors but invalid in excludeSelectors' },
      { config: { excludeSelectors: [null as any, 'button >', '##main-header'] }, description: 'only invalid excludeSelectors and no includeSelectors are provided' } // fallback to default includeSelectors
    ])('And it receives $description', ({ config }) => {
      let warnSpy: jest.SpyInstance;

      beforeEach(() => {
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
        tracker = setupInteractionTracker({ url: new URL(mockUrl), ...config });
      });

      afterEach(() => {
        warnSpy.mockRestore();
      });

      it('Then it should provide a warning and tracking will still occur for valid selectors', () => {
        el.dispatchEvent(clickEvent);

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid selector syntax provided:'));
        expect(tracker.logEvent).toHaveBeenCalled();
      });
    });

    describe.each([
      { config: { includeSelectors: ['##invalid-tag', 'input >', 'div..double-dot'], excludeSelectors: ['button', 'select.class-name', '#id-name'] }, description: 'invalid includeSelectors and valid excludeSelectors provided' },
      { config: { includeSelectors: ['##invalid-tag', '123invalid', undefined as any, ''], excludeSelectors: ['[', '##invalid', null as any, 'input >'] }, description: 'invalid selectors in includeSelectors and invalid in excludeSelectors' },
      { config: { excludeSelectors: ['section:', 'button', '#id-name', '11invalid'] }, description: 'invalid and valid selectors in excludeSelectors (invalid first)' },
      { config: { excludeSelectors: ['button', 'select', '##invalid-tag', 'input >'] }, description: 'invalid and valid selectors in excludeSelectors (valid first)' },
      { config: { includeSelectors: ['##invalid-tag', 'input >', 'div..double-dot'] }, description: 'only invalid includeSelectors' }
    ])('And it receives $description', ({ config }) => {
      let warnSpy: jest.SpyInstance;

      beforeEach(() => {
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
        tracker = setupInteractionTracker({ url: new URL(mockUrl), ...config });
      });

      afterEach(() => {
        warnSpy.mockRestore();
      });

      it('Then it should provide a warning and tracking will not occur', () => {
        el.dispatchEvent(clickEvent);

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid selector syntax provided:'));
        expect(tracker.logEvent).not.toHaveBeenCalled();
      });
    });

    describe("When it is configured with a target generator", () => {
      describe("When the target generator is a string", () => {
        it("When a tracked event is logged, the logEvent should be passed the provided string as Target", () => {
          tracker = setupInteractionTracker({...mockConfig, target: testEventTarget})
          const el = createElementForSelector(defaultIncludedSelectors[0]);

          el.dispatchEvent(clickEvent);

          expect(tracker.logEvent).toHaveBeenCalledWith(expect.anything(), testEventTarget, expect.anything())
        })
      })

      describe("When the target generator is a function", () => {
        it("When a tracked event is logged, the event payload's Target should be the output of the target generator", () => {
          const testTargetGenerator = jest.fn((e: Event) => {
            return `${typeof e} - generated target`
          })

          tracker = setupInteractionTracker({...mockConfig, target: testTargetGenerator})
          const el = createElementForSelector(defaultIncludedSelectors[0]);

          el.dispatchEvent(clickEvent);

          expect(testTargetGenerator).toHaveBeenCalledTimes(1)
          const elementClickedEvent = testTargetGenerator.mock.lastCall?.at(0)
          expect(tracker.logEvent).toHaveBeenCalledWith(expect.anything(), testTargetGenerator(elementClickedEvent), expect.anything())
        })
      })
    })

    describe("When it is configured with an customPayload generator", () => {
      it("When a tracked event is logged, the event payload's additionalPayload should contain the output of the payload generator", () => {
        const testAdditionalPayloadGenerator = jest.fn((e: Event) => {
          return {
            additionalValue1: 'abc',
            additionalValue2: typeof e
          }
        })

        tracker = setupInteractionTracker({...mockConfig, customPayload: testAdditionalPayloadGenerator})
        const el = createElementForSelector(defaultIncludedSelectors[0]);

        el.dispatchEvent(clickEvent);

        expect(testAdditionalPayloadGenerator).toHaveBeenCalledTimes(1)
        const elementClickedEvent = testAdditionalPayloadGenerator.mock.lastCall?.at(0)
        expect(tracker.logEvent).toHaveBeenCalledWith(expect.anything(), expect.anything(), testAdditionalPayloadGenerator(elementClickedEvent))
      })
    })
    it('Then it should pass the correct value for input events', () => {
      tracker = setupInteractionTracker({ url: new URL(mockUrl), includeSelectors: ['input'] });
      const el = createElementWithClass('input', undefined, 'test value');

      el.dispatchEvent(changeEvent);

      expect(tracker.logEvent).toHaveBeenCalledWith(EventType.UserInput, defaultEvent2, {});
    });

    it('Then it should pass the correct value for change events', () => {
      tracker = setupInteractionTracker({ url: new URL(mockUrl) });
      const el = createElementWithClass('button', undefined, 'test value');

      el.dispatchEvent(changeEvent);

      expect(tracker.logEvent).toHaveBeenCalledWith(EventType.UserInput, defaultEvent2, {});
    });

    it('Then it should not track events for elements not specified in includeSelectors', () => {
      tracker = setupInteractionTracker({ url: new URL(mockUrl) });
      const div = createElementWithClass('div');

      div.dispatchEvent(clickEvent);

      expect(tracker.logEvent).not.toHaveBeenCalled();
    });

    it('Then it should not track if target is null', () => {
      tracker = setupInteractionTracker({ url: new URL(mockUrl) });
      Object.defineProperty(clickEvent, 'target', { value: null });
      document.dispatchEvent(clickEvent);

      expect(tracker.logEvent).not.toHaveBeenCalled();
    });
  });

  describe('Given logEvent is called', () => {
    let mockTarget: HTMLElement;
    const mockPageTitle = 'Test Page';
    const mockValue = 'test';
    const mockSessionId = 'abc123';
    const mockUser = 'user1';

    beforeEach(() => {
      mockConfig = createTrackerConfig();
      tracker = new InteractionTracker(mockConfig);

      mockTarget = document.createElement('button');
      mockTarget.id = 'test-btn';

      Object.defineProperty(window, 'location', {
        value: { href: mockConfig.url?.toString() },
        writable: true
      });
      document.title = mockPageTitle;
    });

    it('Then it should call apiCallback with the expected payload', async () => {
      const apiCallback = jest.fn();
      mockConfig.apiCallback = apiCallback;

      await tracker.logEvent(defaultTestEventType, testEventTarget, {});

      expect(apiCallback).toHaveBeenCalled();

      const payload = apiCallback.mock.calls[0][0];

      expect(payload).toEqual(
        expect.objectContaining({
          EventType: defaultTestEventType,
          Target: testEventTarget,
          AdditionalPayload: expect.objectContaining({
            pageUrl: mockConfig.url?.toString(),
            pageTitle: mockPageTitle
          })
        })
      );
    });

    it('Then it should include custom metadata in the payload when provided in the config', async () => {
      const apiCallback = jest.fn();
      const customMeta = { sessionId: mockSessionId, userId: mockUser };

      mockConfig = createTrackerConfig({ apiCallback, metaData: customMeta });
      tracker = new InteractionTracker(mockConfig)

      await tracker.logEvent(defaultTestEventType, testEventTarget, {});

      expect(apiCallback).toHaveBeenCalled();

      const payload = apiCallback.mock.calls[0][0];

      expect(payload).toEqual(
        expect.objectContaining({
          EventType: expect.any(String),
          Target: testEventTarget,
          AdditionalPayload: expect.objectContaining({
            pageUrl: mockConfig.url?.toString(),
            pageTitle: mockPageTitle,
            sessionId: mockSessionId,
            userId: mockUser
          })
        })
      );
    });

    it('Then it should include the output of a custom payload generator, if one is provided, in the sent payload', async () => {
      const apiCallback = jest.fn();

      const customPayload = (eventDetails: Event) => ({
        customField1: 'foo',
        customField2: 'bar'
      });

      mockConfig = createTrackerConfig({ apiCallback });
      tracker = new InteractionTracker(mockConfig);

      await tracker.logEvent(defaultTestEventType, testEventTarget, customPayload(new MouseEvent('click')));

      expect(apiCallback).toHaveBeenCalled();

      const payload = apiCallback.mock.calls[0][0];

      expect(payload).toEqual(
        expect.objectContaining({
          EventType: defaultTestEventType,
          Target: testEventTarget,
          AdditionalPayload: expect.objectContaining({
            customField1: 'foo',
            customField2: 'bar'
          })
        })
      );
    });


    it('Then it should send event via fetch if apiCallback is not provided but url is', async () => {
      mockConfig.apiCallback = undefined;
      mockConfig.url = new URL(mockUrl);
      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      await tracker.logEvent(defaultTestEventType, 'click', {});
      expect(global.fetch).toHaveBeenCalled();
    });

    it('Then it should log an error if no apiCallback or url is provided', async () => {
      mockConfig.apiCallback = undefined;
      mockConfig.url = undefined;

      mockConfig.logCallback = jest.fn();

      await tracker.logEvent(defaultTestEventType, 'click', {});
      expect(logMessage).toHaveBeenCalledWith(
        expect.stringContaining('No apiCallback or url provided for analytics tracking.'),
        LogLevel.ERROR,
        mockConfig.logCallback
      );
    });

    it('Then it should not call logMessage if logCallback is not provided', async () => {
      mockConfig.logCallback = undefined;
      mockConfig.apiCallback = jest.fn();

      await tracker.logEvent(defaultTestEventType, 'click', {});
      expect(logMessage).not.toHaveBeenCalled();
    });

    it('Then it should call console.error if error occurs and no logCallback is provided', async () => {
      mockConfig.apiCallback = () => { throw new Error('fail') };
      mockConfig.logCallback = undefined;
      const spy = jest.spyOn(console, 'error').mockImplementation(() => { });

      await tracker.logEvent(defaultTestEventType, 'click', {});
      expect(spy).toHaveBeenCalledWith('Tracking failed: ', expect.any(Error));
    });
  });

  describe('Given stopEventTracking is called', () => {

    it('Then it should remove event listeners for tracked events', () => {
      mockConfig = createTrackerConfig({ url: new URL(mockUrl) });
      tracker = new InteractionTracker(mockConfig);

      const spy = jest.spyOn(document, 'removeEventListener');

      tracker.startEventTracking();
      tracker.stopEventTracking();

      expect(spy).toHaveBeenCalledWith(defaultEvent1, expect.any(Function), true);
      expect(spy).toHaveBeenCalledWith(defaultEvent2, expect.any(Function), true);
    });

    it('Then it should not throw if no listeners are registered', () => {
      tracker = new InteractionTracker({} as TrackerConfig);
      jest.spyOn(document, 'removeEventListener');

      expect(() => tracker.stopEventTracking()).not.toThrow();
      expect(document.removeEventListener).not.toHaveBeenCalled();
    });
  });
});