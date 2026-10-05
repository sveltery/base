// Supplemental rendered shadow-tree witness for the canonical Floating dependency.
import { expect, it } from 'vitest';
import { activeElement, contains, getTarget } from '@sveltery/utils/shadowDom';

it('follows nested shadow focus, containment and the dispatched composed target', () => {
  const host = document.createElement('div'); document.body.append(host);
  try {
    const outer = host.attachShadow({ mode: 'open' });
    const innerHost = document.createElement('div'); outer.append(innerHost);
    const inner = innerHost.attachShadow({ mode: 'open' });
    const button = document.createElement('button'); inner.append(button); button.focus();
    expect(activeElement(document)).toBe(button);
    expect(contains(host, button)).toBe(true);
    expect(contains(innerHost, button)).toBe(true);
    expect(contains(button, host)).toBe(false);
    let target: EventTarget | undefined;
    host.addEventListener('click', event => { target = getTarget(event); }, { once: true });
    button.click(); expect(target).toBe(button);
    expect(contains(null, button)).toBe(false);
  } finally { host.remove(); }
});
