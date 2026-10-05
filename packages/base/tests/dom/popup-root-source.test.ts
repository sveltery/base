// Selected regular Root declaration adaptations from pinned Source, MIT.
// Pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; ordinary credit pending independent review.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import type { ComponentProps } from 'svelte';
import Fixture from './PopupRootSourceFixture.svelte';
type Family = 'popover' | 'preview-card' | 'tooltip';
type Arrangement = 'contained' | 'detached' | 'multiple-detached';
const cleanup: (() => Promise<void>)[] = [];
const trigger = () => document.getElementById('trigger')!;
const content = () => document.querySelector('[data-testid=popup]');
const positioner = () => document.querySelector('[data-testid=positioner]');
async function setup(family: Family, arrangement: Arrangement, options: Partial<ComponentProps<typeof Fixture>> = {}) {
  vi.useFakeTimers();
  const target = document.createElement('section'); document.body.append(target);
  const instance = mount(Fixture, { target, props: { family, arrangement, ...options } }); cleanup.push(() => unmount(instance));
  flushSync(); await tick(); await vi.advanceTimersByTimeAsync(50); return instance;
}
function mouse(element: Element, name: string) { flushSync(() => element.dispatchEvent(new MouseEvent(name, { bubbles: name === 'mousemove' || name === 'click' }))); }
function hover(element = trigger()) {
  const pointer = new Event('pointerdown', { bubbles: true }); Object.defineProperty(pointer, 'pointerType', { value: 'mouse' });
  flushSync(() => element.dispatchEvent(pointer)); mouse(element, 'mouseenter'); mouse(element, 'mousemove');
}
async function advance(milliseconds: number) { await vi.advanceTimersByTimeAsync(milliseconds); await tick(); }
afterEach(async () => { for (const stop of cleanup.splice(0)) await stop(); vi.useRealTimers(); vi.restoreAllMocks(); document.body.replaceChildren(); document.body.removeAttribute('style'); document.documentElement.removeAttribute('style'); });

for (const family of ['popover', 'preview-card', 'tooltip'] as const) for (const arrangement of ['contained', 'detached', 'multiple-detached'] as const) {
  const label = `${family} ${arrangement}`;
  if (family === 'popover') {
    it(`${label}: renders the children`, async () => { await setup(family, arrangement); expect(trigger().textContent).toBe('Toggle'); });
    it(`${label}: closes when the anchor is clicked twice`, async () => {
      await setup(family, arrangement); mouse(trigger(), 'click'); await tick(); expect(content()).not.toBeNull();
      mouse(trigger(), 'click'); await tick(); expect(content()).toBeNull();
    });
  } else {
    it(`${label}: opens when the trigger is hovered`, async () => { await setup(family, arrangement); hover(); await advance(600); expect(content()).not.toBeNull(); });
    it(`${label}: closes when the trigger is unhovered`, async () => {
      await setup(family, arrangement); hover(); await advance(600); mouse(trigger(), 'mouseleave'); await advance(family === 'preview-card' ? 300 : 0); expect(content()).toBeNull();
    });
    it(`${label}: opens when the trigger is focused`, async () => {
      await setup(family, arrangement); flushSync(() => trigger().focus()); await advance(600); expect(content()).not.toBeNull();
    });
    it(`${label}: closes when the trigger is blurred`, async () => {
      await setup(family, arrangement); flushSync(() => trigger().focus()); await advance(600);
      flushSync(() => trigger().blur()); await advance(family === 'preview-card' ? 300 : 600); expect(content()).toBeNull();
    });
  }

  for (const controlled of [undefined, false, true]) it(`${label}: defaultOpen with open=${String(controlled)}`, async () => {
    await setup(family, arrangement, { defaultOpen: true, open: controlled }); await tick(); expect(!!content()).toBe(controlled !== false);
  });

  it(`${label}: calls onOpenChange only when opening and closing`, async () => {
    const previous = vi.fn(); await setup(family, arrangement, { controlledSync: true, onPreviousOpen: previous });
    expect(content()).toBeNull();
    if (family === 'popover') mouse(trigger(), 'click'); else { hover(); await advance(600); }
    await tick(); expect(content()).not.toBeNull();
    if (family === 'popover') mouse(trigger(), 'click'); else { mouse(trigger(), 'mouseleave'); await advance(family === 'preview-card' ? 300 : 0); }
    await tick(); expect(content()).toBeNull(); expect(previous.mock.calls).toEqual([[false], [true]]);
  });

  if (family !== 'popover') {
    it(`${label}: does not call onChange when the open state does not change`, async () => {
      const previous = vi.fn(); await setup(family, arrangement, { controlledSync: true, onPreviousOpen: previous }); expect(content()).toBeNull();
      hover(); await advance(600); expect(content()).not.toBeNull(); expect(previous.mock.calls).toEqual([[false]]);
    });
    it(`${label}: defaultOpen remains uncontrolled`, async () => {
      await setup(family, arrangement, { defaultOpen: true }); expect(content()).not.toBeNull();
      mouse(trigger(), 'mouseleave'); await advance(family === 'preview-card' ? 300 : 0); expect(content()).toBeNull();
    });
    it(`${label}: opens after delay100`, async () => {
      await setup(family, arrangement, { delay: 100 }); hover(); await tick(); expect(content()).toBeNull(); await advance(100); expect(content()).not.toBeNull();
    });
    it(`${label}: closes after closeDelay100`, async () => {
      await setup(family, arrangement, { closeDelay: 100 }); hover(); await advance(600); expect(content()).not.toBeNull();
      mouse(trigger(), 'mouseleave'); expect(content()).not.toBeNull(); await advance(100); expect(content()).toBeNull();
    });
  }

  if (family === 'preview-card') {
    it(`${label}: does not close after hovering out of a popup opened externally`, async () => {
      const instance = await setup(family, arrangement, { controlledSync: true }); flushSync(() => instance.openExternally()); await tick(); expect(content()).not.toBeNull();
      mouse(positioner()!, 'mouseenter'); mouse(positioner()!, 'mouseleave'); await advance(300); expect(content()).not.toBeNull();
    });
    it(`${label}: closes after hovering out of a popup opened by its trigger`, async () => {
      await setup(family, arrangement, { controlledSync: true }); hover(); await advance(600); expect(content()).not.toBeNull();
      mouse(positioner()!, 'mouseenter'); mouse(positioner()!, 'mouseleave'); await advance(300); expect(content()).toBeNull();
    });
    it(`${label}: defaultOpen does not close after hovering out without trigger hover`, async () => {
      await setup(family, arrangement, { defaultOpen: true }); expect(content()).not.toBeNull();
      mouse(positioner()!, 'mouseenter'); mouse(positioner()!, 'mouseleave'); await advance(300); expect(content()).not.toBeNull();
    });
  }

  if (family === 'popover') {
    it(`${label}: defaultOpen remains uncontrolled`, async () => {
      await setup(family, arrangement, { defaultOpen: true }); expect(content()).not.toBeNull();
      mouse(trigger(), 'click'); await tick(); expect(content()).toBeNull();
    });
    it(`${label}: retained first close unmounts after external reopen and normal close`, async () => {
      const instance = await setup(family, arrangement, { controlledSync: true, preventFirstUnmount: true });
      mouse(trigger(), 'click'); await tick(); expect(trigger().hasAttribute('data-popup-open')).toBe(true); expect(content()).not.toBeNull();
      mouse(trigger(), 'click'); await tick(); expect(trigger().hasAttribute('data-popup-open')).toBe(false); expect(content()).not.toBeNull();
      flushSync(() => instance.openExternally()); await tick(); expect(trigger().hasAttribute('data-popup-open')).toBe(true);
      mouse(trigger(), 'click'); await tick(); expect(content()).toBeNull();
    });
    it(`${label}: does not close after hovering out of a popup opened externally`, async () => {
      const instance = await setup(family, arrangement, { controlledSync: true, openOnHover: true, delay: 0 });
      flushSync(() => instance.openExternally()); await tick(); expect(content()).not.toBeNull();
      mouse(positioner()!, 'mouseenter'); mouse(positioner()!, 'mouseleave'); await tick(); expect(content()).not.toBeNull();
    });
    it(`${label}: closes after hovering out of a popup opened by its trigger`, async () => {
      await setup(family, arrangement, { controlledSync: true, openOnHover: true, delay: 0 });
      hover(); await tick(); expect(content()).not.toBeNull();
      mouse(positioner()!, 'mouseenter'); mouse(positioner()!, 'mouseleave'); await tick(); expect(content()).toBeNull();
    });
    it(`${label}: defaultOpen does not close after hovering out without trigger hover`, async () => {
      await setup(family, arrangement, { defaultOpen: true, openOnHover: true }); expect(content()).not.toBeNull();
      mouse(positioner()!, 'mouseenter'); mouse(positioner()!, 'mouseleave'); await tick(); expect(content()).not.toBeNull();
    });
    it(`${label}: opens after delay100`, async () => {
      await setup(family, arrangement, { openOnHover: true, delay: 100 }); hover(); await tick(); expect(content()).toBeNull();
      await advance(100); expect(content()).not.toBeNull();
    });
    it(`${label}: closeDelay100 retains through50 then closes at100`, async () => {
      await setup(family, arrangement, { openOnHover: true, closeDelay: 100 }); hover(); await advance(300); expect(content()).not.toBeNull();
      mouse(trigger(), 'mouseleave'); await advance(50); expect(content()).not.toBeNull(); await advance(50); expect(content()).toBeNull();
    });
  }

  if (family !== 'tooltip') it(`${label}: onOpenChange cancel prevents uncontrolled opening`, async () => {
    await setup(family, arrangement, { onOpenChange: (next, details) => { if (next) details.cancel(); } });
    if (family === 'popover') mouse(trigger(), 'click'); else hover(); await tick(); expect(content()).toBeNull();
    if (family === 'preview-card') { await advance(600); expect(content()).toBeNull(); }
  });

  if (family === 'preview-card') it(`${label}: reopens on mouse-only hover after Escape`, async () => {
    await setup(family, arrangement, { delay: 100 }); hover(); await advance(100); expect(content()).not.toBeNull();
    flushSync(() => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))); await tick(); expect(content()).toBeNull();
    mouse(trigger(), 'mouseenter'); mouse(trigger(), 'mousemove'); await advance(100); expect(content()).not.toBeNull();
  });

  if (family === 'tooltip') it(`${label}: first preventUnmountOnClose does not retain later closes`, async () => {
    await setup(family, arrangement, { preventFirstUnmount: true, delay: 0, closeDelay: 0 });
    hover(); await tick(); expect(positioner()).not.toBeNull(); mouse(trigger(), 'mouseleave'); await tick(); expect(positioner()).not.toBeNull();
    hover(); await tick(); expect(trigger().hasAttribute('data-popup-open')).toBe(true);
    mouse(trigger(), 'mouseleave'); await tick(); expect(positioner()).toBeNull();
  });

  it(`${label}: public close action reports imperative-action`, async () => {
    const change = vi.fn(); const instance = await setup(family, arrangement, { onOpenChange: change, delay: 0, defaultOpen: family === 'popover' });
    if (family !== 'popover') hover(); await tick(); expect(content()).not.toBeNull();
    flushSync(() => instance.close()); await advance(0); expect(positioner()).toBeNull(); expect(trigger().hasAttribute('data-popup-open')).toBe(false);
    expect(change).toHaveBeenLastCalledWith(false, expect.objectContaining({ reason: 'imperative-action' }));
  });

  it(`${label}: public unmount action releases a retained popup`, async () => {
    const instance = await setup(family, arrangement, { preventEveryUnmount: true, delay: 0, closeDelay: 0 });
    if (family === 'popover') mouse(trigger(), 'click'); else hover(); await tick(); expect(positioner()).not.toBeNull();
    if (family === 'popover') mouse(trigger(), 'click'); else mouse(trigger(), 'mouseleave'); await tick(); expect(positioner()).not.toBeNull();
    flushSync(() => instance.unmountPopup()); await tick(); expect(positioner()).toBeNull();
  });
}
