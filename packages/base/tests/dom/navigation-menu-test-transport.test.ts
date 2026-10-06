// Supplemental test-transport regression; no Original ordinary declaration credit.
import { afterEach, expect, it, vi } from 'vitest';
import { createNavigationMenuTestTransport } from '../../../../apps/fixtures/src/lib/navigation-menu-test-transport.js';
const cleanup: Array<() => void | Promise<void>> = [];
afterEach(async () => {
  for (const dispose of cleanup.splice(0).reverse()) await dispose();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

it('uses native enter semantics without adding React normalization', async () => {
  const button = document.createElement('button');
  document.body.append(button);
  const events: string[] = [];
  for (const type of ['mouseenter', 'mouseover'])
    button.addEventListener(type, (event) => events.push(event.type));
  const transport = createNavigationMenuTestTransport();
  transport.ready();
  cleanup.push(transport.dispose);
  await transport.fire(button, 'mouseenter');
  expect(events).toEqual(['mouseenter']);
});

it('uses actual React enter normalization and act across a fixture remount', async () => {
  // Capture the native config before the real pure.js module establishes its act wrappers.
  const first = createNavigationMenuTestTransport();
  const { React, renderer, referenceTransport } =
    await import('../../../../apps/fixtures/src/lib/navigation-menu-reference-renderer.js');
  for (const index of [0, 1]) {
    const transport = index === 0 ? first : createNavigationMenuTestTransport();
    const container = document.createElement('section');
    document.body.append(container);
    function App() {
      const [entered, setEntered] = React.useState(0);
      return React.createElement(
        'button',
        { onMouseEnter: () => setEntered((value) => value + 1) },
        String(entered),
      );
    }
    const view = renderer.render(React.createElement(App), { container, reactStrictMode: true });
    transport.ready(referenceTransport, () => {
      view.unmount();
      renderer.cleanup();
    });
    const button = container.querySelector('button')!;
    const events: string[] = [];
    for (const type of ['mouseenter', 'mouseover'])
      button.addEventListener(type, (event) => events.push(event.type));
    button.dispatchEvent(new MouseEvent('mouseenter'));
    expect(button.textContent).toBe('0'); // The prior native-only dispatch misses React's enter callback.
    events.length = 0;
    await transport.fire(button, 'mouseenter');
    expect(events).toEqual(['mouseenter', 'mouseover']);
    expect(button.textContent).toBe('1');
    await transport.dispose();
    expect(container.isConnected).toBe(false);
  }
});

it('owns user-event document preparation and restores focus, clipboard and listeners', async () => {
  const focus = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'focus');
  const blur = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'blur');
  const clipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  const documentSymbols = Object.getOwnPropertySymbols(document);
  const add = vi.spyOn(document, 'addEventListener');
  const remove = vi.spyOn(document, 'removeEventListener');
  const transport = createNavigationMenuTestTransport();
  transport.ready();
  const prepared = add.mock.calls.filter(([type]) => type === 'focus' || type === 'blur');
  expect(prepared).toHaveLength(2);
  await transport.dispose();
  for (const [type, listener, options] of prepared)
    expect(remove).toHaveBeenCalledWith(type, listener, options);
  expect(Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'focus')).toEqual(focus);
  expect(Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'blur')).toEqual(blur);
  expect(Object.getOwnPropertyDescriptor(navigator, 'clipboard')).toEqual(clipboard);
  expect(Object.getOwnPropertySymbols(document)).toEqual(documentSymbols);
});

it('retains the Original describe-owned App identity when removing an earlier item', async () => {
  const { React, renderer, referenceTransport } =
    await import('../../../../apps/fixtures/src/lib/navigation-menu-reference-renderer.js');
  const { NavigationMenuPartsOriginal } =
    await import('../../../../apps/fixtures/src/lib/navigation-menu-parts-source-original.js');
  const container = document.createElement('section');
  document.body.append(container);
  const view = renderer.render(
    React.createElement(NavigationMenuPartsOriginal, { scenario: 'list-removal' }),
    { container, reactStrictMode: true },
  );
  const transport = createNavigationMenuTestTransport();
  transport.ready(referenceTransport, () => {
    view.unmount();
    renderer.cleanup();
  });
  cleanup.push(transport.dispose);
  const first = container.querySelector('[data-testid="first"]') as HTMLElement;
  const middle = container.querySelector('[data-testid="middle"]') as HTMLElement;
  const last = container.querySelector('[data-testid="last"]') as HTMLElement;
  await transport.mutate(() => first.focus());
  await transport.fire(first, 'keydown', { key: 'ArrowRight' });
  await transport.fire(middle, 'keydown', { key: 'ArrowRight' });
  expect(document.activeElement).toBe(last);
  await transport.mutate(() =>
    (
      window as typeof window & { navigationMenuParts: { removeFirst(): void } }
    ).navigationMenuParts.removeFirst(),
  );
  expect(container.querySelector('[data-testid="last"]')).toBe(last);
  expect(document.activeElement).toBe(last);
  await transport.fire(last, 'keydown', { key: 'ArrowLeft' });
  expect(document.activeElement).toBe(middle);
});
