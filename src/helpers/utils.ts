import { EventType } from "../analytics";

export const injectScript = (src: string, id: string, nonce?: string) => {
  if (!document.getElementById(id)) {
    const script = document.createElement('script');
    script.src = src;
    script.id = id;
    script.async = true;
    script.nonce = nonce || '';
    script.type = 'text/javascript';
    document.body.appendChild(script);
  }
};

export const injectLink = (href: string, id: string, nonce?: string) => {
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.href = href;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.nonce = nonce || '';
    link.id = id;
    document.head.appendChild(link);
  }
};

export const createElementWithClass = (tag: string, className?: string, value?: string): HTMLElement => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (value !== undefined) (el as HTMLInputElement).value = value;
  document.body.appendChild(el);
  return el;
};

export const createElementForSelector = (selector: string): HTMLElement => {
  if (selector.startsWith('.')) {
    const el = document.createElement('button');
    el.classList.add(selector.slice(1));
    document.body.appendChild(el);
    return el;
  } else if (selector.startsWith('#')) {
    const el = document.createElement('button');
    el.id = selector.slice(1);
    document.body.appendChild(el);
    return el;
  } else {
    // tag selector by default
    const el = document.createElement('button');
    document.body.appendChild(el);
    return el;
  }
};