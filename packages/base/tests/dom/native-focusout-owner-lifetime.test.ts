// Actual public DOM focusout/owner lifetime; zero unchanged Original assertion credit.
import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import type { MenuRoot } from '../../src/lib/menu/types.js';
import Fixture from './NativeFocusoutOwnerLifetimeFixture.svelte';

const cleanups: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
  document.body.replaceChildren();
  document.body.removeAttribute('style');
  document.documentElement.removeAttribute('style');
});

async function setup() {
  const target = document.createElement('main');
  document.body.append(target);
  const requests: { open: boolean; details: MenuRoot.ChangeEventDetails }[] = [];
  const component = mount(Fixture, {
    target,
    props: { portalContainer: target, report: (open, details) => requests.push({ open, details }) },
  });
  cleanups.push(() => unmount(component));
  await tick();
  const trigger = target.querySelector<HTMLButtonElement>('#focusout-trigger')!;
  const item = target.querySelector<HTMLElement>('#focusout-item')!;
  const outside = target.querySelector<HTMLButtonElement>('#focusout-outside')!;
  const positioner = target.querySelector('[data-testid="focusout-positioner"]');
  const popup = target.querySelector('[data-testid="focusout-popup"]');
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(positioner).not.toBeNull();
  expect(popup?.getAttribute('role')).toBe('menu');
  item.focus();
  expect(document.activeElement).toBe(item);
  expect(requests).toEqual([]);
  // Leave the popup through its actual trigger before testing reference focusout.
  trigger.focus();
  await tick();
  expect(document.activeElement).toBe(trigger);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(requests).toEqual([]);
  return { target, trigger, item, outside, positioner, popup, requests };
}

it('keeps live-owner native focusout closing the actual menu without returning outside focus', async () => {
  const { trigger, outside, requests } = await setup();
  outside.focus();
  expect(document.activeElement).toBe(outside);
  expect(requests).toEqual([]);
  await tick();
  expect(requests).toHaveLength(1);
  expect(requests[0].open).toBe(false);
  expect(requests[0].details.reason).toBe('focus-out');
  expect(requests[0].details.event?.type).toBe('focusout');
  expect(requests[0].details.event?.target).toBe(trigger);
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(document.activeElement).toBe(outside);
});

it('discards queued native focusout close work after only its popup owner is removed', async () => {
  const { target, trigger, outside, positioner, requests } = await setup();
  outside.focus();
  expect(document.activeElement).toBe(outside);
  expect(requests).toEqual([]);
  // Native work is still queued: remove the actual focus-manager owner without yielding.
  flushSync(() => target.querySelector<HTMLButtonElement>('#remove-focusout-owner')!.click());
  expect(target.querySelector('[data-testid="focusout-popup"]')).toBeNull();
  expect(target.querySelector('[data-testid="focusout-positioner"]')).toBe(positioner);
  expect(target.querySelector('#focusout-trigger')).toBe(trigger);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(document.activeElement).toBe(outside);
  await tick();
  expect(requests).toEqual([]);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(document.activeElement).toBe(outside);
});
