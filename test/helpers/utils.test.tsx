import { injectScript, injectLink, createElementWithClass, createElementForSelector } from '../../src/helpers/utils';
import { EventType } from '../../src/analytics';

describe('DOM utility functions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  describe('injectScript', () => {
    it('should inject a script if not already present', () => {
      injectScript('https://example.com/script.js', 'test-script', 'abc123');

      const script = document.getElementById('test-script') as HTMLScriptElement;
      expect(script).not.toBeNull();
      expect(script.src).toBe('https://example.com/script.js');
      expect(script.nonce).toBe('abc123');
      expect(script.type).toBe('text/javascript');
      expect(script.async).toBe(true);
    });

    it('should not inject script again if it already exists', () => {
      const existing = document.createElement('script');
      existing.id = 'existing-script';
      document.body.appendChild(existing);

      injectScript('https://example.com/another.js', 'existing-script');

      const scripts = document.querySelectorAll('script#existing-script');
      expect(scripts.length).toBe(1);
    });
  });

  describe('injectLink', () => {
    it('should inject a link if not already present', () => {
      injectLink('https://example.com/style.css', 'test-style', 'nonce456');

      const link = document.getElementById('test-style') as HTMLLinkElement;
      expect(link).not.toBeNull();
      expect(link.href).toBe('https://example.com/style.css');
      expect(link.rel).toBe('stylesheet');
      expect(link.nonce).toBe('nonce456');
      expect(link.type).toBe('text/css');
    });

    it('should not inject link again if it already exists', () => {
      const existing = document.createElement('link');
      existing.id = 'existing-style';
      document.head.appendChild(existing);

      injectLink('https://example.com/another-style.css', 'existing-style');

      const links = document.querySelectorAll('link#existing-style');
      expect(links.length).toBe(1);
    });
  });

  describe('createElementWithClass', () => {
    it('should create an element with the specified tag', () => {
      const el = createElementWithClass('div');
      expect(el.tagName.toLowerCase()).toBe('div');
    });

    it('should assign the provided class name', () => {
      const el = createElementWithClass('span', 'my-class');
      expect(el.className).toBe('my-class');
    });

    it('should set the value if provided for input elements', () => {
      const el = createElementWithClass('input', undefined, 'test-value');
      expect((el as HTMLInputElement).value).toBe('test-value');
    });

    it('should append the element to document.body', () => {
      const el = createElementWithClass('button');
      expect(document.body.contains(el)).toBe(true);
    })
  });

  describe('createElementForSelector', () => {
    it('should create a button with the specified class for a class selector', () => {
      const el = createElementForSelector('.test-class');
      expect(el.tagName.toLowerCase()).toBe('button');
      expect(el.classList.contains('test-class')).toBe(true);
    });

    it('should create a button with the specified id for an id selector', () => {
      const el = createElementForSelector('#test-id')
      expect(el.tagName.toLowerCase()).toBe('button');
      expect(el.id).toBe('test-id')
    });

    it('should append the element to the document body', () => {
      const el = createElementForSelector('test');
      expect(document.body.contains(el)).toBe(true);
    });
  });
});