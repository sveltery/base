import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './Fixture.svelte';
import type { ChangeEventDetails } from '../../src/lib/dialog/types.js';
// Supplemental actual Svelte DOM wiring checks. Synthetic jsdom input is NOT browser parity.
const mounted: ReturnType<typeof mount>[] = [];
async function settle() {
  await tick();
  await new Promise((resolve) => setTimeout(resolve, 60));
  await tick();
}
function setup(options: Record<string, unknown> = {}) {
  const log: {
    channel: string;
    open?: boolean;
    details?: ChangeEventDetails;
    before?: string | null;
  }[] = [];
  const host = document.createElement('section');
  document.body.append(host);
  const component = mount(Fixture, {
    target: host,
    props: {
      log: (channel, open, details) =>
        log.push({
          channel,
          open,
          details,
          before: details?.trigger?.getAttribute('aria-expanded'),
        }),
      ...options,
    },
  });
  mounted.push(component);
  return { component, log, host };
}
function click(id: string) {
  document.getElementById(id)!.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
}
function escape() {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
}
afterEach(async () => {
  for (const component of mounted.splice(0)) await unmount(component);
  document.body.replaceChildren();
  document.documentElement.removeAttribute('style');
});
describe('contained Dialog supplemental DOM wiring', () => {
  it('mounts actual portal; orders native callback and internal dispatch; closes and returns focus', async () => {
    const { log } = setup();
    await settle();
    expect(document.querySelector('[role=dialog]')).toBeNull();
    const trigger = document.getElementById('opener')!;
    trigger.focus();
    const event = new MouseEvent('click', { bubbles: true, detail: 1 });
    trigger.dispatchEvent(event);
    await settle();
    const popup = document.querySelector('[role=dialog]')!;
    expect(popup.closest('[data-base-ui-portal]')!.parentNode).toBe(document.body);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(popup.id);
    expect(log.slice(0, 3).map((x) => x.channel)).toEqual(['click', 'consumer', 'internal']);
    expect(log[1].details?.event).toBe(event);
    expect(log[1].details?.trigger).toBe(trigger);
    expect(log[1].details?.reason).toBe('trigger-press');
    expect(log[1].before).toBe('false');
    escape();
    await settle();
    expect(document.querySelector('[role=dialog]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(log.filter((x) => x.channel === 'consumer').at(-1)?.before).toBe('true');
    expect(
      log.filter((x) => x.channel === 'consumer').map((x) => [x.open, x.details?.reason]),
    ).toEqual([
      [true, 'trigger-press'],
      [false, 'escape-key'],
    ]);
    expect(document.documentElement.style.overflow).toBe('');
  });
  for (const cancel of ['open', 'close'])
    it(`cancellation suppresses state and internal dispatch (${cancel})`, async () => {
      const { log } = setup({ cancel, initial: cancel === 'close' });
      await settle();
      if (cancel === 'open') click('opener');
      else escape();
      await settle();
      expect(!!document.querySelector('[role=dialog]')).toBe(cancel === 'close');
      expect(log.filter((x) => x.channel === 'consumer')).toHaveLength(1);
      expect(log.filter((x) => x.channel === 'internal')).toHaveLength(0);
      expect(log.find((x) => x.channel === 'consumer')?.details?.isCanceled).toBe(true);
    });
  it('held controlled requests cannot change effective open until the owner changes props', async () => {
    const { component, log } = setup({ controlled: true });
    await settle();
    click('opener');
    await settle();
    expect(document.querySelector('[role=dialog]')).toBeNull();
    component.setOpen(true);
    await settle();
    expect(document.querySelector('[role=dialog]')).not.toBeNull();
    escape();
    await settle();
    expect(document.querySelector('[role=dialog]')).not.toBeNull();
    component.setOpen(false);
    await settle();
    expect(document.querySelector('[role=dialog]')).toBeNull();
    expect(
      log.filter((x) => x.channel === 'consumer').map((x) => [x.open, x.details?.reason]),
    ).toEqual([
      [true, 'trigger-press'],
      [false, 'escape-key'],
    ]);
  });
  it('composition prevention suppresses actual Trigger activation', async () => {
    const { log } = setup({ prevent: true });
    await settle();
    click('opener');
    await settle();
    expect(document.querySelector('[role=dialog]')).toBeNull();
    expect(log.map((x) => x.channel)).toEqual(['click']);
  });
  it('keepMounted hides closed DOM without issuing an initial completion', async () => {
    const { log } = setup({ keep: true });
    await settle();
    expect(document.querySelector<HTMLElement>('[role=dialog]')!.hidden).toBe(true);
    expect(log).toEqual([]);
    click('opener');
    await settle();
    expect(document.querySelector<HTMLElement>('[role=dialog]')!.hidden).toBe(false);
    // This is a completed-opening case. Closing before its frame completes
    // legitimately aborts that callback, especially under full-suite load.
    await vi.waitFor(() =>
      expect(log.filter((x) => x.channel === 'complete').map((x) => x.open)).toEqual([true]),
    );
    click('closer');
    await settle();
    expect(document.querySelector<HTMLElement>('[role=dialog]')!.hidden).toBe(true);
    await vi.waitFor(() =>
      expect(log.filter((x) => x.channel === 'complete').map((x) => x.open)).toEqual([true, false]),
    );
  });
  it('nested cleanup preserves parent lock, counts and one Escape ownership', async () => {
    const { component } = setup({ nested: true });
    await settle();
    click('opener');
    await settle();
    const parent = document.querySelector<HTMLElement>('[role=dialog]')!;
    expect(parent.style.getPropertyValue('--nested-dialogs')).toBe('0');
    click('child-opener');
    await settle();
    expect(document.querySelectorAll('[role=dialog]')).toHaveLength(2);
    expect(parent.style.getPropertyValue('--nested-dialogs')).toBe('1');
    escape();
    await settle();
    expect(document.querySelectorAll('[role=dialog]')).toHaveLength(1);
    expect(parent.style.getPropertyValue('--nested-dialogs')).toBe('0');
    expect(document.body.style.overflowY).toBe('hidden');
    component.remove();
    await settle();
    expect(document.querySelectorAll('[data-base-ui-portal]')).toHaveLength(0);
    expect(document.documentElement.style.overflow).toBe('');
  });
  it('labels change IDs and unregister without leaving stale ARIA references', async () => {
    const { component } = setup();
    await settle();
    click('opener');
    await settle();
    const popup = document.querySelector('[role=dialog]')!;
    expect(popup.getAttribute('aria-labelledby')).toBe(document.querySelector('h2')!.id);
    component.labelChange('new-title');
    await settle();
    expect(popup.getAttribute('aria-labelledby')).toBe('new-title');
    component.removeLabel();
    await settle();
    expect(popup.hasAttribute('aria-labelledby')).toBe(false);
  });
  it('deferred removal waits for imperative unmount', async () => {
    const { component, log } = setup({ cancel: 'defer' });
    await settle();
    click('opener');
    await settle();
    click('opener');
    await settle();
    expect(document.querySelector<HTMLElement>('[role=dialog]')!.hidden).toBe(false);
    expect(log.filter((x) => x.channel === 'complete' && x.open === false)).toHaveLength(0);
    component.unmountPopup();
    await settle();
    expect(document.querySelector('[role=dialog]')).toBeNull();
    expect(log.filter((x) => x.channel === 'complete' && x.open === false)).toHaveLength(1);
    expect(document.getElementById('opener')!.getAttribute('aria-expanded')).toBe('false');
  });
  it('scroll lock restores a preexisting inline lock', async () => {
    document.documentElement.style.setProperty('overflow', 'clip', 'important');
    setup();
    await settle();
    click('opener');
    await settle();
    // Original locking chooses the viewport scroller and writes longhands, preserving this shorthand.
    expect(document.documentElement.style.overflow).toBe('clip');
    click('closer');
    await settle();
    expect(document.documentElement.style.getPropertyValue('overflow')).toBe('clip');
    expect(document.documentElement.style.getPropertyPriority('overflow')).toBe('important');
  });
});
it('restores different preexisting overflow longhands', async () => {
  document.documentElement.style.setProperty('overflow-x', 'clip', 'important');
  document.documentElement.style.setProperty('overflow-y', 'scroll');
  setup();
  await settle();
  click('opener');
  await settle();
  click('closer');
  await settle();
  expect(document.documentElement.style.getPropertyValue('overflow-x')).toBe('clip');
  // Original Object.assign restoration retains the value but loses CSS priority.
  expect(document.documentElement.style.getPropertyPriority('overflow-x')).toBe('');
  expect(document.documentElement.style.getPropertyValue('overflow-y')).toBe('scroll');
});
it('controlled owner can reopen after a completed close', async () => {
  const { component } = setup({ controlled: true });
  await settle();
  component.setOpen(true);
  await settle();
  component.setOpen(false);
  await settle();
  expect(document.querySelector('[role=dialog]')).toBeNull();
  component.setOpen(true);
  await settle();
  expect(document.querySelector('[role=dialog]')).not.toBeNull();
});
it('custom keyboard activation composes a generated click and preserves modifiers', async () => {
  const { log } = setup({ custom: true });
  await settle();
  const trigger = document.getElementById('opener')!;
  expect(trigger.textContent).toContain('Open');
  trigger.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true, shiftKey: true }),
  );
  await settle();
  expect(document.querySelector('[role=dialog]')).not.toBeNull();
  expect(log.slice(0, 3).map((x) => x.channel)).toEqual(['click', 'consumer', 'internal']);
  expect(log[1].details?.event.type).toBe('click');
  expect((log[1].details?.event as MouseEvent).shiftKey).toBe(true);
  expect((log[1].details?.event as MouseEvent).detail).toBe(0);
  escape();
  await settle();
  trigger.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true }));
  await settle();
  expect(document.querySelector('[role=dialog]')).not.toBeNull();
});
it('consumer preventDefault cancels custom Enter activation', async () => {
  const { log } = setup({ custom: true, preventKey: true });
  await settle();
  document
    .getElementById('opener')!
    .dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  await settle();
  expect(document.querySelector('[role=dialog]')).toBeNull();
  expect(log).toEqual([]);
});
it('Close composition can prevent its actual internal handler', async () => {
  const { log } = setup({ preventClose: true });
  await settle();
  click('opener');
  await settle();
  click('closer');
  await settle();
  expect(document.querySelector('[role=dialog]')).not.toBeNull();
  expect(log.filter((x) => x.channel === 'consumer')).toHaveLength(1);
  expect(log.filter((x) => x.channel === 'close-click')).toHaveLength(1);
});

it('controlled owner reopen resets close deferral for the new cycle', async () => {
  const { component, log } = setup({ controlled: true, cancel: 'defer' });
  await settle();
  component.setOpen(true);
  await settle();
  escape();
  component.setOpen(false);
  await settle();
  expect(document.querySelector('[role=dialog]')).not.toBeNull();
  component.setOpen(true);
  await settle();
  component.stopDeferring();
  escape();
  component.setOpen(false);
  await settle();
  expect(document.querySelector('[role=dialog]')).toBeNull();
  expect(log.filter((x) => x.channel === 'complete' && x.open === false)).toHaveLength(1);
});
for (const flushClose of [false, true])
  it(`imperative deferred unmount invalidates a queued keepMounted completion (flush=${flushClose})`, async () => {
    const { component, log } = setup({ keep: true, cancel: 'defer' });
    await settle();
    click('opener');
    await settle();
    escape();
    if (flushClose) await tick();
    component.unmountPopup();
    await settle();
    expect(document.querySelector<HTMLElement>('[role=dialog]')!.hidden).toBe(true);
    expect(log.filter((x) => x.channel === 'complete' && x.open === false)).toHaveLength(1);
  });
it('changing parent modality preserves nested topmost order and lock ownership', async () => {
  const { component, log } = setup({ nested: true });
  await settle();
  click('opener');
  await settle();
  click('child-opener');
  await settle();
  component.setModal('trap-focus');
  await settle();
  expect(document.body.style.overflowY).toBe('hidden');
  escape();
  await settle();
  expect(document.querySelector('[data-testid=child]')).toBeNull();
  expect(document.querySelector('[role=dialog]')).not.toBeNull();
  expect(log.filter((x) => x.channel === 'consumer')).toHaveLength(1);
  expect(document.documentElement.style.overflow).toBe('');
  component.setModal(true);
  await settle();
  expect(document.body.style.overflowY).toBe('hidden');
  escape();
  await settle();
  expect(document.querySelector('[role=dialog]')).toBeNull();
});
it('Escape preserves IME composition and dismisses after composition settles', async () => {
  const { log } = setup();
  await settle();
  click('opener');
  await settle();
  const target = document.getElementById('closer')!;
  target.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
  escape();
  await settle();
  expect(document.querySelector('[role=dialog]')).not.toBeNull();
  target.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
  escape(); // Same-turn Safari ordering: compositionend can precede the IME Escape.
  await settle();
  expect(document.querySelector('[role=dialog]')).not.toBeNull();
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', isComposing: true, bubbles: true }),
  );
  await settle();
  // The source composition-event ref owns suppression; a lone KeyboardEvent flag is not consulted.
  expect(log.filter((x) => x.channel === 'consumer')).toHaveLength(2);
  expect(document.querySelector('[role=dialog]')).toBeNull();
});
it('popup completion ignores infinite descendant animations', async () => {
  const { log } = setup({ keep: true });
  await settle();
  click('opener');
  await settle();
  const popup = document.querySelector<HTMLElement>('[role=dialog]')!;
  const calls: unknown[] = [];
  Object.defineProperty(popup, 'getAnimations', {
    value: (options?: GetAnimationsOptions) => {
      calls.push(options);
      return options?.subtree ? [{ playState: 'running', finished: new Promise(() => {}) }] : [];
    },
  });
  escape();
  await settle();
  expect(popup.hidden).toBe(true);
  expect(calls).toEqual([undefined, undefined]);
  expect(log.filter((x) => x.channel === 'complete' && x.open === false)).toHaveLength(1);
});
it('consumer attachments reach actual replacement nodes and clean up alongside refs', async () => {
  const { component, log } = setup({ attachConsumer: true, custom: true });
  await settle();
  expect(document.getElementById('opener')!.dataset.consumerAttached).toBe('');
  expect(log.filter((x) => x.channel === 'attached')).toHaveLength(1);
  click('opener');
  await settle();
  expect(log.filter((x) => x.channel === 'attached')).toHaveLength(1);
  component.remove();
  await settle();
  expect(log.filter((x) => x.channel === 'detached')).toHaveLength(1);
  expect(document.documentElement.style.overflow).toBe('');
});
