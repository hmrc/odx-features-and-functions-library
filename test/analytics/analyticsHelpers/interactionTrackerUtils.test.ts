import {
  mapEventType,
  validateAndFilterSelectors,
  elementCheck,
  formatTarget
} from "../../../src/analytics/analyticsHelpers/interactionTrackerUtils"
import { EventType } from "../../../src/analytics";

describe('Given that mapEventType is called', () => {
  describe.each([
    { domEventType: 'click', tag: 'a', expected: EventType.Link, description: 'click on <a>' },
    { domEventType: 'click', tag: 'button', expected: EventType.Navigation, description: 'click on <button>' },
    { domEventType: 'click', tag: 'input', expected: EventType.UserInput, description: 'click on <input>' },
    { domEventType: 'click', tag: 'textarea', expected: EventType.UserInput, description: 'click on <textarea>' },
    { domEventType: 'click', tag: 'select', expected: EventType.UserInput, description: 'click on <select>' },
    { domEventType: 'change', tag: 'input', expected: EventType.UserInput, description: 'change event' },
    { domEventType: 'input', tag: 'input', expected: EventType.UserInput, description: 'input event' },
    { domEventType: 'error', tag: 'div', expected: EventType.Error, description: 'error event' },
    { domEventType: 'unknown', tag: 'div', expected: EventType.Other, description: 'unknown event type' }
  ])('When domEventType is "$domEventType" and tag is <$tag> ($description)', ({ domEventType, tag, expected }) => {
    it(`Then it should return ${expected}`, () => {
      const el = document.createElement(tag);
      expect(mapEventType(domEventType, el)).toBe(expected);
    });
  });
});


describe('Given that validateSelectors is called', () => {
  let warnSpy: jest.SpyInstance;

  const validSelectors = [
    'button',
    '.my-btn',
    '#my-btn',
    '.btn-primary',
    '#main-header',
    'div.container',
    '[data-role=\"modal\"]',
    '.hidden',
    'input:disabled',
    'section.ad-banner',
    'a[href=\"#\"]',
    'john' // valid syntax even though it is a useless selector
  ];

  const invalidSelectors = [
    '##invalid', // invalid tag
    '', // empty string
    null as any, // null selector
    undefined as any, // undefined selector
    'div..double-dot', // invalid class syntax
    '[=value', // malformed attribute selector
    '***bad===selector', // illegal characters
    '123notASelector', // digits first
    'button >', // incomplete combinator
    'section:', // invalid pseudo-class
    'input::' // malformed pseudo-element
  ];

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe.each([
    { selectors: validSelectors, expected: validSelectors, description: 'all selectors are valid' },
    { selectors: [], expected: [], description: 'empty selector array (vacuously true)' }
  ])('When selectors are $selectors ($description)', ({ selectors, expected }) => {
    it(`Then it should return the original list as is and not warn`, () => {
      const actual = validateAndFilterSelectors(selectors);

      expect(actual).toEqual(expected);
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe.each([
    { selectors: invalidSelectors, expected: [], description: 'all selectors are invalid' },
    { selectors: ['div..double-dot', 'button', 'div.valid-class', '123invalid'], expected: ['button', 'div.valid-class'], description: 'invalid selectors are provided with valid selectors (invalid first value)' },
    { selectors: ['select', '', '#valid-id', null as any], expected: ['select', '#valid-id'], description: 'invalid selectors are provided with valid selectors (valid first value)' }
  ])('When selectors are $selectors ($description)', ({ selectors, expected }) => {
    it(`Then it should remove invalid selectors from the list and warn`, () => {
      const actual = validateAndFilterSelectors(selectors);

      expect(actual).toEqual(expected);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid selector syntax provided:'));
    });
  });
});

describe('Given that elementCheck is called', () => {
  let button: HTMLElement;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    button = document.createElement('button');
    button.className = 'my-btn';
    button.id = 'my-btn';
    document.body.appendChild(button);

    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    warnSpy.mockRestore();
  });

  describe.each([
    { selectors: ['button', '.my-btn'], expected: true, description: 'matches tag and class selector in DOM' },
    { selectors: ['button'], expected: true, description: 'matches tag selector but not id or class in DOM' },
    { selectors: ['.my-btn'], expected: true, description: 'matches class selector but not tag or id in DOM' },
    { selectors: ['#my-btn'], expected: true, description: 'matches id selector but not tag or class in DOM' },
    { selectors: ['.not-present-in-dom', '#not-present-in-dom', 'div'], expected: false, description: 'does not match any selectors present in the DOM' },
    { selectors: [], expected: false, description: 'empty selector array' },
    { selectors: ['button', '##invalid'], expected: true, description: 'a valid selector in the DOM along with an invalid selector (valid selector occurs before invalid)' }
  ])('When selectors are $selectors ($description)', ({ selectors, expected }) => {
    it(`Then it should return ${expected}`, () => {
      const actual = elementCheck(selectors, document.querySelector('button')!);

      expect(actual).toBe(expected);
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  // validation logic should catch any invalid selectors before they reach elementCheck
  // but if they are missed, elementCheck will handle this
  describe.each([
    { selectors: ['##invalid', 'button'], expected: true, description: 'first value is invalid, last one is valid' },
    { selectors: ['##invalid', 'button>'], expected: false, description: 'both values are invalid' },
  ])('When selectors are $selectors ($description)', ({ selectors, expected }) => {
    it(`Then it should return ${expected}`, () => {
      const actual = elementCheck(selectors, document.querySelector('button')!);
      expect(actual).toBe(expected);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(`Invalid selector provided: `));
    });
  });
});

describe('Given that formatTarget is called', () => {
  describe.each([
    {
      eventType: 'Link',
      tag: 'a',
      textContent: 'Example Link',
      href: 'https://example.com/',
      expected: 'Example Link <https://example.com/>',
      description: 'Link eventType with anchor element and text'
    },
    {
      eventType: 'Link',
      tag: 'a',
      textContent: '',
      href: 'https://example.com/',
      expected: ' <https://example.com/>',
      description: 'Link eventType with anchor and no text'
    },
    {
      eventType: 'Navigation',
      tag: 'button',
      textContent: '',
      href: '',
      expected: '<button></button>',
      description: 'non-Link eventType returns outerHTML'
    },
    {
      eventType: 'Link',
      tag: 'a',
      textContent: 'No href',
      href: '',
      expected: 'No href <>',
      description: 'Link eventType with anchor and no href'
    }
  ])('When eventType is "$eventType", tag is <$tag> ($description)', ({ eventType, tag, textContent, href, expected }) => {
    const el = document.createElement(tag);

    beforeEach(() => {
      if (textContent) el.textContent = textContent;
      if ('href' in el) (el as HTMLAnchorElement).href = href;
    });
    it(`Then it should return the correct formatted string`, () => {
      const actual = formatTarget(eventType, el as HTMLElement);

      expect(actual).toBe(expected);
    });
  });
});