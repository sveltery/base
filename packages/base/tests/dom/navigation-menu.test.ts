// Base UI 1.8.0 NavigationMenu business probes at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: parity/navigation-menu/UPSTREAM_LICENSE. Supplemental checks have zero ordinary credit.
import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './NavigationMenuFixture.svelte';
const mounted: ReturnType<typeof mount>[] = [];
async function setup(scenario = 'default') {
  const target = document.createElement('section');
  document.body.append(target);
  const component = mount(Fixture, { target, props: { scenario } });
  mounted.push(component);
  await tick();
  return component;
}
async function settle() {
  await tick();
  for (let i = 0; i < 3; i++) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await tick();
  }
}
const first = () => document.getElementById('first-trigger') as HTMLButtonElement;
const popup = () => document.getElementById('tested-popup');
afterEach(async () => {
  for (const component of mounted.splice(0)) await unmount(component);
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

it('supplement: Source composition opens and moves the active Content into the actual Viewport', async () => {
  const component = await setup();
  expect(popup()).toBeNull();
  first().click();
  await settle();
  expect(first().getAttribute('aria-expanded')).toBe('true');
  expect(first().getAttribute('aria-controls')).toBe('tested-popup');
  expect(document.getElementById('tested-viewport')?.contains(document.getElementById('first-content'))).toBe(true);
  expect(component.snapshot().events).toEqual([{ value: 'first', reason: 'trigger-press', canceled: false }]);
  expect(document.getElementById('tested-icon')?.hasAttribute('data-popup-open')).toBe(true);
});

it.each(['zero', 'false', 'empty'])('supplement: preserves the valid falsy Item value %s', async (scenario) => {
  const component = await setup(scenario);
  first().click();
  await settle();
  expect(first().getAttribute('aria-expanded')).toBe('true');
  expect(component.snapshot().events[0].value).toBe(scenario === 'zero' ? 0 : scenario === 'false' ? false : '');
});

it('supplement: canceled uncontrolled requests preserve value and presence', async () => {
  const component = await setup('cancel');
  first().click();
  await settle();
  expect(first().getAttribute('aria-expanded')).toBe('false');
  expect(popup()).toBeNull();
  expect(component.snapshot().events).toEqual([{ value: 'first', reason: 'trigger-press', canceled: true }]);
});

it('supplement: controlled requests wait for live owner state and change active trigger', async () => {
  const component = await setup('controlled');
  first().click();
  await settle();
  expect(popup()).toBeNull();
  component.setValue('first');
  await settle();
  expect(first().getAttribute('aria-expanded')).toBe('true');
  component.setValue('second');
  await settle();
  expect(document.getElementById('second-trigger')?.getAttribute('aria-expanded')).toBe('true');
  expect(document.getElementById('tested-viewport')?.contains(document.getElementById('second-content'))).toBe(true);
  component.setValue(null);
  await settle();
  expect(popup()).toBeNull();
});

it('supplement: keepMounted preserves inactive Content and the same popup on close', async () => {
  await setup('keep');
  await settle();
  const content = document.getElementById('first-content')!;
  const originalPopup = popup();
  expect(content.hidden).toBe(true);
  first().click();
  await settle();
  expect(content.hidden).toBe(false);
  first().click();
  await settle();
  expect(popup()).toBe(originalPopup);
  expect(content.hidden).toBe(true);
});

it('supplement: manual actions defer completion and perform Source unmount', async () => {
  const component = await setup('manual');
  await settle();
  first().click();
  await settle();
  expect(popup()).not.toBeNull();
  expect(component.snapshot().completions).toEqual([]);
  component.snapshot().actions?.unmount();
  await settle();
  expect(popup()).toBeNull();
  expect(component.snapshot().completions).toEqual([false]);
});

it('supplement: disabled triggers remain focusable and suppress activation', async () => {
  const component = await setup('disabled');
  first().focus();
  first().click();
  await settle();
  expect(document.activeElement).toBe(first());
  expect(first().disabled).toBe(false);
  expect(first().getAttribute('aria-disabled')).toBe('true');
  expect(popup()).toBeNull();
  expect(component.snapshot().events).toEqual([]);
});
