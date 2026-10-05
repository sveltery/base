// Base UI 1.8.0 NavigationMenu business probes at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: parity/navigation-menu/UPSTREAM_LICENSE. Supplemental checks have zero ordinary credit.
import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './NavigationMenuFixture.svelte';
import { createNavigationMenuTestTransport } from '../../../../apps/fixtures/src/lib/navigation-menu-test-transport.js';
import { mockAnimations, mockBoundingClientRect } from '../../../../apps/fixtures/src/lib/navigation-menu-source-mocks.js';
const mounted: ReturnType<typeof mount>[] = [];
const transports: ReturnType<typeof createNavigationMenuTestTransport>[] = [];
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
  for (const transport of transports.splice(0)) await transport.dispose();
  for (const component of mounted.splice(0)) await unmount(component);
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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

it('Source Root:1657 switching by dispatched click emits only the two requested values', async () => {
  const component = await setup();
  first().click();
  await settle();
  expect(component.snapshot().events.map((event: { value: unknown }) => event.value)).toEqual(['first']);
  (document.getElementById('second-trigger') as HTMLButtonElement).click();
  await settle();
  expect(component.snapshot().events.map((event: { value: unknown }) => event.value)).toEqual(['first', 'second']);
});

it('supplement: a direct hover switch retains the new trigger pointer lock after old hover cleanup', async () => {
  const component = await setup();
  first().dispatchEvent(new MouseEvent('mouseenter'));
  first().dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
  await new Promise<void>((resolve) => setTimeout(resolve, 70));
  await tick();
  const list = document.getElementById('tested-list')!;
  expect(list.style.pointerEvents).toBe('none');

  const second = document.getElementById('second-trigger')!;
  second.dispatchEvent(new MouseEvent('mouseenter'));
  second.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
  await tick();
  await Promise.resolve();
  expect(component.snapshot().events.map((event: { value: unknown }) => event.value)).toEqual(['first', 'second']);
  expect(first().getAttribute('aria-expanded')).toBe('false');
  expect(second.getAttribute('aria-expanded')).toBe('true');
  expect(list.style.pointerEvents).toBe('none');
});

it('supplement: capture restores tabbing before the inside guard forwards focus after a submenu switch', async () => {
  await setup();
  const transport = createNavigationMenuTestTransport();
  transport.ready();
  transports.push(transport);
  first().focus();
  first().click();
  await settle();
  await transport.input('tab');
  expect(document.activeElement).toBe(document.getElementById('first-link'));
  await transport.input('tab');
  const second = document.getElementById('second-trigger') as HTMLButtonElement;
  expect(document.activeElement).toBe(second);
  second.click();
  await settle();
  await transport.input('tab');
  expect(document.activeElement).toBe(document.getElementById('second-link'));
});

it('supplement: parent completion retains the captured exiting Content attributes while its animation is pending', async () => {
  vi.stubGlobal('BASE_UI_ANIMATIONS_DISABLED', false);
  const component = await setup('controlled');
  component.setValue('first');
  await settle();
  const second = document.getElementById('second-trigger') as HTMLButtonElement;
  mockBoundingClientRect(first(), { x: 0, y: 0, width: 80, height: 32 });
  mockBoundingClientRect(second, { x: 120, y: 0, width: 80, height: 32 });
  second.click();
  component.setValue('second');
  await settle();
  const exiting = document.getElementById('second-content')!;
  expect(exiting.getAttribute('data-activation-direction')).toBe('right');
  const animations = mockAnimations(exiting);
  animations.start();
  // Browser's real empty parent animation list completes independently of the
  // Source Content mock; JSDOM has no getAnimations implementation by default.
  Object.defineProperty(popup()!, 'getAnimations', { configurable: true, value: () => [] });
  component.setValue(null);
  await tick();
  expect(exiting.hasAttribute('data-ending-style')).toBe(true);
  await settle();
  expect(popup()).toBeNull();
  expect(exiting.isConnected).toBe(false);
  expect(exiting.hasAttribute('data-ending-style')).toBe(true);
  expect(exiting.hasAttribute('data-activation-direction')).toBe(false);
  await animations.finish();
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
