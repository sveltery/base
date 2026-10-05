// Detached Root Source declaration adaptations. Pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c,
// MIT: parity/popup-family/UPSTREAM_LICENSE. Independent body review and ordinary credit pending.
import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import type { ComponentProps } from 'svelte';
import * as Popover from '../../src/lib/popover/index.js';
import * as PreviewCard from '../../src/lib/preview-card/index.js';
import * as Tooltip from '../../src/lib/tooltip/index.js';
import Fixture from './PopupDetachedSourceFixture.svelte';

type Family = 'popover' | 'preview-card' | 'tooltip';
const cleanup: (() => Promise<void>)[] = [];
const byId = (id: string) => document.getElementById(id)!;
const content = () => document.querySelector<HTMLElement>('[data-testid=content]');
const payload = () => document.querySelector('[data-testid=payload]')?.textContent;
async function settle() { await tick(); await new Promise(resolve => setTimeout(resolve, 50)); await tick(); }
function handles() { return { popover: Popover.createHandle<number>(), previewCard: PreviewCard.createHandle<number>(), tooltip: Tooltip.createHandle<number>() }; }
async function setup(family: Family, options: Partial<ComponentProps<typeof Fixture>> = {}) {
  const target = document.createElement('section'); document.body.append(target);
  const allHandles = handles();
  const props = { family, ...allHandles, ...options };
  const instance = mount(Fixture, { target, props }); cleanup.push(() => unmount(instance));
  await settle(); return { instance, handle: family === 'popover' ? props.popover : family === 'preview-card' ? props.previewCard : props.tooltip };
}
async function activate(family: Family, id: string) { if (family === 'popover') byId(id).click(); else byId(id).focus(); await settle(); }
afterEach(async () => { for (const stop of cleanup.splice(0)) await stop(); await settle(); vi.restoreAllMocks(); document.body.replaceChildren(); document.body.removeAttribute('style'); document.documentElement.removeAttribute('style'); });

for (const family of ['popover', 'preview-card', 'tooltip'] as const) {
  it(`${family}: ignores imperative handle calls made before a root is attached`, async () => {
    const allHandles = handles(); const handle = family === 'popover' ? allHandles.popover : family === 'preview-card' ? allHandles.previewCard : allHandles.tooltip;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    handle.open('trigger'); handle.close();
    expect(handle.isOpen).toBe(false);
    expect(warn.mock.calls.filter(([message]) => typeof message === 'string' && message.includes('no root using this handle is mounted'))).toHaveLength(2);
    warn.mockRestore();
    await setup(family, { ...allHandles, triggerCount: 1 });
    expect(content()).toBeNull(); expect(payload()).toBe('No payload');
    if (family === 'popover') await activate(family, 'trigger'); else { handle.open('trigger'); await settle(); }
    expect(content()).not.toBeNull(); expect(payload()).toBe('1');
    if (family !== 'popover') expect(byId('trigger').hasAttribute('data-popup-open')).toBe(true);
  });

  it(`${family}: ignores imperative handle calls made after the root is detached`, async () => {
    const { instance, handle } = await setup(family, { triggerCount: 1 });
    const trigger = byId('trigger');
    if (family === 'popover') await activate(family, 'trigger'); else { handle.open('trigger'); await settle(); }
    expect(content()).not.toBeNull(); expect(payload()).toBe('1');
    instance.rootMounted(false); await settle(); expect(handle.isOpen).toBe(false); expect(content()).toBeNull();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    handle.open('trigger'); handle.close();
    expect(handle.isOpen).toBe(false);
    expect(warn.mock.calls.filter(([message]) => typeof message === 'string' && message.includes('no root using this handle is mounted'))).toHaveLength(2);
    warn.mockRestore();
    instance.rootMounted(true); await settle(); expect(content()).toBeNull(); expect(payload()).toBe('No payload');
    expect(byId('trigger')).toBe(trigger);
    if (family === 'popover') await activate(family, 'trigger'); else { handle.open('trigger'); await settle(); }
    expect(content()).not.toBeNull(); expect(payload()).toBe('1');
  });

  it(`${family}: registers a detached trigger declared after the root`, async () => {
    const { handle } = await setup(family, { location: 'after', triggerCount: 1 });
    if (family === 'popover') await activate(family, 'trigger'); else { handle.open('trigger'); await settle(); }
    expect(content()).not.toBeNull();
    expect(byId('trigger').getAttribute(family === 'popover' ? 'aria-expanded' : 'data-popup-open')).toBe(family === 'popover' ? 'true' : '');
  });

  it(`${family}: throws when called with an unregistered trigger id`, async () => {
    const { handle } = await setup(family, { location: 'after', triggerCount: 1 });
    expect(() => handle.open('missing')).toThrow('was called with the trigger id "missing"');
    expect(handle.isOpen).toBe(false);
  });

  it(`${family}: warns when a handle stays attached to more than one mounted root`, async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await setup(family, { overlap: true });
    expect(warn.mock.calls.some(([message]) => typeof message === 'string' && message.includes('more than one mounted root'))).toBe(true);
  });

  for (const location of ['inside', 'before'] as const) {
    it(`${family}: ${location} allows setting an initially open popup`, async () => {
      await setup(family, { location, defaultOpen: true, defaultTriggerId: 'trigger-2', payloadContent: true });
      expect(content()?.textContent).toBe('2');
    });

    it(`${family}: ${location} reuses the popup and positioner DOM nodes when switching triggers`, async () => {
      await setup(family, { location, payloadContent: true });
      await activate(family, 'trigger-1');
      const popupElement = content(); const positionerElement = document.querySelector('[data-testid=positioner]');
      expect(popupElement).not.toBeNull();
      await activate(family, 'trigger-2');
      expect(content()).toBe(popupElement); expect(document.querySelector('[data-testid=positioner]')).toBe(positionerElement);
    });
  }

  it(`${family}: imperative handle opens and closes the popup`, async () => {
    const { handle } = await setup(family, { triggerCount: 1 });
    expect(content()).toBeNull();
    handle.open('trigger'); await settle(); expect(content()).not.toBeNull(); expect(content()?.textContent).toBe('Content');
    expect(byId('trigger').getAttribute(family === 'popover' ? 'aria-expanded' : 'data-popup-open')).toBe(family === 'popover' ? 'true' : '');
    handle.close(); await settle(); expect(content()).toBeNull();
    expect(byId('trigger').getAttribute(family === 'popover' ? 'aria-expanded' : 'data-popup-open')).toBe(family === 'popover' ? 'false' : null);
  });

  it(`${family}: imperative handle sets the payload associated with the trigger`, async () => {
    const { handle } = await setup(family, { payloadContent: true });
    expect(content()).toBeNull(); handle.open('trigger-2'); await settle();
    expect(content()?.textContent).toBe('2'); expect(byId('trigger-2').hasAttribute('data-popup-open')).toBe(true);
    expect(byId('trigger-1').hasAttribute('data-popup-open')).toBe(false);
    if (family === 'popover') { expect(byId('trigger-2').getAttribute('aria-expanded')).toBe('true'); expect(byId('trigger-1').getAttribute('aria-expanded')).not.toBe('true'); }
    handle.close(); await settle(); expect(content()).toBeNull(); expect(byId('trigger-2').hasAttribute('data-popup-open')).toBe(false);
    if (family === 'popover') expect(byId('trigger-2').getAttribute('aria-expanded')).toBe('false');
  });

  if (family !== 'popover') for (const location of ['inside', 'before'] as const) {
    it(`${family}: ${location} closes when the active trigger unmounts`, async () => {
      const { instance } = await setup(family, { location, defaultOpen: true, defaultTriggerId: 'trigger-1', payloadContent: true });
      expect(content()?.textContent).toBe('1'); instance.removeFirstTrigger(); await settle();
      expect(document.getElementById('trigger-1')).toBeNull(); expect(byId('trigger-2').hasAttribute('data-popup-open')).toBe(false); expect(content()).toBeNull();
    });
  }
}
