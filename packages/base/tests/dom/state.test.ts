import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/StateFixture.svelte';
// Actual Svelte companion wiring; synthetic jsdom input earns no browser credit.
const mounted: ReturnType<typeof mount>[] = [];
async function settle() { await tick(); await new Promise(resolve => setTimeout(resolve, 60)); await tick(); }
async function setup(scenario: string) {
  const target = document.createElement('section'); document.body.append(target);
  mounted.push(mount(Fixture, { target, props: { scenario } }));
  await settle();
}
function button(name: string) { return [...document.querySelectorAll<HTMLElement>('button, [role=button]')].find(node => node.textContent === name)!; }
async function click(name: string) { button(name).click(); await settle(); }
// Owner prop updates are separate from clicks, which correctly emit virtual outside presses.
async function control(name: string) { await (document.querySelector('main') as HTMLElement & { controlOwner: (name: string) => Promise<void> }).controlOwner(name); await settle(); }
function calls() { return JSON.parse(document.querySelector('[data-testid=calls]')!.textContent!) as { open: boolean; reason: string; triggerIsUndefined: boolean }[]; }
function popup() { return document.querySelector<HTMLElement>('[role=dialog]'); }
afterEach(async () => { for (const component of mounted.splice(0)) await unmount(component); document.body.replaceChildren(); });
for (const scenario of ['ownership', 'missing', 'native', 'custom', 'undefined', 'prevent', 'closed']) it(`state companion: ${scenario}`, async () => {
  await setup(scenario);
  if (scenario === 'ownership') {
    const first = button('Trigger 1'); await click('Trigger 1');
    const controls = first.getAttribute('aria-controls'); expect(controls).toBe(popup()!.id);
    await click('Mount trigger 2');
    expect(first.getAttribute('aria-expanded')).toBe('true');
    expect(first.getAttribute('aria-controls')).toBe(controls);
    expect(button('Trigger 2').getAttribute('aria-expanded')).toBe('false');
    expect(button('Trigger 2').hasAttribute('aria-controls')).toBe(false);
  } else if (scenario === 'missing') {
    (document.querySelector('main') as HTMLElement & { closeDialog: () => void }).closeDialog(); await settle();
    expect(calls()).toHaveLength(1);
    expect(calls()[0].open).toBe(false);
    expect(calls()[0].reason).toBe('imperative-action');
    expect(calls()[0].triggerIsUndefined).toBe(true);
  } else if (scenario === 'prevent') {
    await click('Close'); expect(popup()).not.toBeNull(); expect(calls()).toHaveLength(0);
  } else if (scenario === 'closed') {
    button('Close').dispatchEvent(new MouseEvent('click', { bubbles: true })); await settle();
    expect(document.querySelector('[data-testid=clicks]')!.textContent).toBe('1');
    expect(calls()).toHaveLength(0);
  } else {
    expect(calls()).toHaveLength(0); await click('Open');
    expect(calls()).toHaveLength(1); expect(calls()[0].open).toBe(true);
    const close = button('Close');
    if (scenario !== 'undefined') {
      expect(close.hasAttribute('disabled')).toBe(scenario === 'native');
      expect(close.hasAttribute('data-disabled')).toBe(true);
      if (scenario === 'custom') expect(close.getAttribute('aria-disabled')).toBe('true');
      await click('Close'); expect(calls()).toHaveLength(1);
    } else {
      await click('Close'); expect(calls()).toHaveLength(2); expect(calls()[1].open).toBe(false);
    }
  }
});
for (const initiallyOpen of [false, true]) it(`cancellation exposes unchanged internal state when controlled input is released (${initiallyOpen})`, async () => {
  await setup('controlled');
  if (initiallyOpen) { await click('Open'); await control('Owner open'); }
  const before = calls().length;
  await control('Toggle cancel');
  if (initiallyOpen) { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await settle(); }
  else await click('Open');
  expect(calls()).toHaveLength(before + 1);
  expect(document.querySelector('[data-testid=owner]')!.textContent).toBe(String(initiallyOpen));
  const order = JSON.parse(document.querySelector('[data-testid=order]')!.textContent!);
  expect(order.slice(initiallyOpen ? 2 : 0)).toEqual([{ channel: 'consumer', open: !initiallyOpen, before: String(initiallyOpen), reason: initiallyOpen ? 'escape-key' : 'trigger-press', canceled: true }]);
  await control('Release control'); expect(Boolean(popup())).toBe(initiallyOpen);
  await control('Toggle cancel');
  if (initiallyOpen) { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await settle(); }
  else await click('Open');
  expect(Boolean(popup())).toBe(!initiallyOpen);
});
