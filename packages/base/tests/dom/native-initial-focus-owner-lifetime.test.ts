// Actual public DOM initial-focus/owner lifetime; zero unchanged Original assertion credit.
import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import type { PopoverRootChangeEventDetails } from '../../src/lib/popover/types.js';
import Fixture from './NativeInitialFocusOwnerLifetimeFixture.svelte';

const cleanups: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
  document.body.replaceChildren();
  document.body.removeAttribute('style');
  document.documentElement.removeAttribute('style');
});

function nextNativeFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function setupQueuedInitialFocus() {
  const target = document.createElement('main');
  document.body.append(target);
  const requests: { open: boolean; details: PopoverRootChangeEventDetails }[] = [];
  const initialTargets: (HTMLElement | null)[] = [];
  const component = mount(Fixture, {
    target,
    props: {
      portalContainer: target,
      report: (open, details) => requests.push({ open, details }),
      reportInitialTarget: (element) => initialTargets.push(element),
    },
  });
  cleanups.push(() => unmount(component));
  await tick();
  const trigger = target.querySelector<HTMLButtonElement>('#initial-focus-trigger')!;
  const outside = target.querySelector<HTMLButtonElement>('#initial-focus-outside')!;
  const initialTarget = target.querySelector<HTMLButtonElement>('#initial-focus-target')!;
  const positioner = target.querySelector('[data-testid="initial-focus-positioner"]');
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(positioner).not.toBeNull();
  expect(initialTarget).not.toBeNull();
  expect(target.querySelector('[data-testid="initial-focus-popup"]')).toBeNull();
  outside.focus();
  expect(document.activeElement).toBe(outside);

  flushSync(() => target.querySelector<HTMLButtonElement>('#show-initial-focus-owner')!.click());
  await tick();
  const popup = target.querySelector('[data-testid="initial-focus-popup"]');
  expect(popup?.getAttribute('role')).toBe('dialog');
  expect(popup?.contains(initialTarget)).toBe(false);
  expect(initialTargets).toContain(initialTarget);
  expect(document.activeElement).toBe(outside);
  expect(requests).toEqual([]);
  return { target, trigger, outside, initialTarget, positioner, popup, requests };
}

it('focuses the actual retained public initialFocus target on a live owner native frame', async () => {
  const { target, trigger, initialTarget, positioner, popup, requests } =
    await setupQueuedInitialFocus();
  await nextNativeFrame();
  expect(document.activeElement).toBe(initialTarget);
  expect(target.querySelector('[data-testid="initial-focus-popup"]')).toBe(popup);
  expect(target.querySelector('[data-testid="initial-focus-positioner"]')).toBe(positioner);
  expect(target.querySelector('#initial-focus-trigger')).toBe(trigger);
  expect(target.querySelector('#initial-focus-target')).toBe(initialTarget);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(requests).toEqual([]);
}, 5000);

it('does not let a removed popup owner steal outside focus on its queued initial native frame', async () => {
  const { target, trigger, outside, initialTarget, positioner, requests } =
    await setupQueuedInitialFocus();
  outside.focus();
  flushSync(() => target.querySelector<HTMLButtonElement>('#remove-initial-focus-owner')!.click());
  expect(target.querySelector('[data-testid="initial-focus-popup"]')).toBeNull();
  expect(target.querySelector('[data-testid="initial-focus-positioner"]')).toBe(positioner);
  expect(target.querySelector('#initial-focus-trigger')).toBe(trigger);
  expect(target.querySelector('#initial-focus-target')).toBe(initialTarget);
  expect(initialTarget.isConnected).toBe(true);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(document.activeElement).toBe(outside);
  await nextNativeFrame();
  expect(target.querySelector('[data-testid="initial-focus-popup"]')).toBeNull();
  expect(target.querySelector('[data-testid="initial-focus-positioner"]')).toBe(positioner);
  expect(target.querySelector('#initial-focus-trigger')).toBe(trigger);
  expect(target.querySelector('#initial-focus-target')).toBe(initialTarget);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(document.activeElement).toBe(outside);
  expect(requests).toEqual([]);
}, 5000);
