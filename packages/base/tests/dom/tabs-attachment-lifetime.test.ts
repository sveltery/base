// Pinned Source owner business plus native Svelte outro lifecycle supplement.
// The JSDOM WAAPI timing shim grants zero secured-browser/unchanged ordinary credit.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from '../browser/TabsAttachmentLifetimeFixture.svelte';
const referenceRequire = createRequire(resolve('../../apps/fixtures/package.json'));
const { createElement: h, act } = referenceRequire('react');
const { createRoot } = referenceRequire('react-dom/client');
const { Tabs } = referenceRequire('@base-ui/react/tabs');

it('exact-pin Source keeps replacement button disabled synchronization and diagnostics owned', async () => {
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const messages: string[] = [];
  const spy = vi
    .spyOn(console, 'error')
    .mockImplementation((...args) => messages.push(args.join(' ')));
  function source(replacement: boolean, disabled = false, nativeButton = true) {
    return h(
      Tabs.Root,
      { defaultValue: 0 },
      h(
        Tabs.List,
        {},
        h(
          Tabs.Tab,
          {
            value: 0,
            disabled,
            nativeButton,
            render: h('button', {
              key: replacement ? 'new' : 'old',
              'data-host': replacement ? 'new' : 'old',
            }),
          },
          'Current tab',
        ),
      ),
    );
  }
  try {
    await act(async () => root.render(source(false)));
    const old = host.querySelector('[data-host=old]')!;
    await act(async () => root.render(source(true)));
    const current = host.querySelector<HTMLButtonElement>('[data-host=new]')!;
    expect(current).not.toBe(old);
    expect(old.isConnected).toBe(false); // Measured React replacement has no native Svelte outro retention.
    current.disabled = true;
    await act(async () => root.render(source(true, true)));
    expect(current.getAttribute('aria-disabled')).toBe('true');
    expect(current.disabled).toBe(false);
    await act(async () => root.render(source(true, true, false)));
    expect(messages.some((message) => message.includes('expected a non-<button>'))).toBe(true);
  } finally {
    await act(async () => root.unmount());
    spy.mockRestore();
    host.remove();
  }
});

for (const behavior of ['disabled synchronization', 'diagnostic'] as const) {
  it(`native retained-host cleanup keeps current button ${behavior} owned (JSDOM timing supplement)`, async () => {
    const originalAnimate = Object.getOwnPropertyDescriptor(Element.prototype, 'animate');
    Object.defineProperty(Element.prototype, 'animate', {
      configurable: true,
      value(_frames: Keyframe[], options: KeyframeAnimationOptions) {
        let canceled = false;
        const duration = Number(options.duration ?? 0);
        const animation = {
          currentTime: 0,
          onfinish: null as (() => void) | null,
          cancel() {
            canceled = true;
            clearTimeout(timer);
          },
          effect: { getComputedTiming: () => ({ progress: 0 }) },
        };
        const timer = setTimeout(() => {
          if (!canceled) {
            animation.currentTime = duration;
            animation.onfinish?.();
          }
        }, duration);
        return animation;
      },
    });
    const messages: string[] = [];
    const spy = vi
      .spyOn(console, 'error')
      .mockImplementation((...args) => messages.push(args.join(' ')));
    const target = document.createElement('div');
    document.body.append(target);
    const component = mount(Fixture, { target });
    const click = async (text: string) => {
      [...target.querySelectorAll('button')].find((node) => node.textContent === text)!.click();
      flushSync();
      await tick();
    };
    try {
      flushSync();
      await tick();
      const old = target.querySelector('[data-host=old]')!;
      await click('Replace host');
      const current = target.querySelector<HTMLButtonElement>('[data-host=new]')!;
      expect(old.isConnected).toBe(true);
      expect(current.isConnected).toBe(true);
      await vi.waitFor(() => expect(old.isConnected).toBe(false), { timeout: 1500 });
      expect(target.querySelector('[aria-label="Bound host"]')!.textContent).toBe('new');
      if (behavior === 'disabled synchronization') {
        await click('Disable current host');
        expect(current.getAttribute('aria-disabled')).toBe('true');
        expect(current.disabled).toBe(false);
      } else {
        await click('Change native expectation');
        expect(messages.some((message) => message.includes('expected a non-<button>'))).toBe(true);
      }
    } finally {
      await unmount(component);
      spy.mockRestore();
      target.remove();
      if (originalAnimate) Object.defineProperty(Element.prototype, 'animate', originalAnimate);
      else Reflect.deleteProperty(Element.prototype, 'animate');
    }
  });
}
