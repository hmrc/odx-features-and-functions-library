import { EventType } from "../analyticsPayload";

// check if the selector is SYNTACTICALLY valid
export const validateAndFilterSelectors = (selectors: Array<string>): Array<string> => {
  return selectors.filter(sel => {
    // make sure that null, undefined and empty strings are explicity caught
    if (!sel || typeof sel !== 'string' || sel.trim() === '') {
      console.warn(`Invalid selector syntax provided: ${sel}`)
      return false;
    }
    try {
      document.createDocumentFragment().querySelector(sel);
      return true;
    } catch {
      console.warn(`Invalid selector syntax provided: ${sel}`)
      return false;
    }
  });
};

// check if a selector is relevant to that particular target
export const elementCheck = (selectors: Array<string>, target: Element): boolean => {
  return selectors.some(sel => {
    try {
      return target.closest(sel) !== null;
    } catch {
      console.warn(`Invalid selector provided: ${sel}`);
      return false;
    }
  });
};

export const mapEventType = (domEventType: string, target: HTMLElement): EventType => {
  const tag = target.tagName.toLowerCase();

  switch (domEventType) {
    case 'click':
      if (tag === 'a') return EventType.Link;
      if (tag === 'button') return EventType.Navigation;
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return EventType.UserInput;
      return EventType.Other;
      break;
    case 'change':
    case 'input':
      return EventType.UserInput;
      break;
    case 'error':
      return EventType.Error;
      break;
    default:
      return EventType.Other;
  }
}

export const formatTarget = (eventType: string, target: HTMLElement): string => {
  if (eventType === 'Link') {
    const linkText = target.textContent?.trim() || '';
    const href = (target as HTMLAnchorElement).getAttribute('href') ?? '';
    return `${linkText} <${href}>`;
  }
  return target.outerHTML || '';
}