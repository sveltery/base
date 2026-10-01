// Direct assertion ports/DOM companions. Pinned provenance: parity/button/upstream-inventory.json. MIT: UPSTREAM_LICENSE.
import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/ButtonFixture.svelte';
const mounted: ReturnType<typeof mount>[] = [];
async function setup(scenario: string) {
  const target = document.createElement('section'); document.body.append(target);
  mounted.push(mount(Fixture, { target, props: { scenario } })); await tick();
  return document.getElementById('tested-button')!;
}
function calls() { return JSON.parse(document.querySelector('[data-testid=calls]')!.textContent!) as Record<string, number>; }
function key(node: HTMLElement, type: string, value: string) { return node.dispatchEvent(new KeyboardEvent(type, { key: value, bubbles: true, cancelable: true })); }
afterEach(async () => { for (const component of mounted.splice(0)) await unmount(component); document.body.replaceChildren(); });
it('B:42 custom semantics and real capture/render/ancestor clicks', async () => {
  const button = await setup('custom');
  expect(button.tagName).toBe('SPAN'); expect(button.getAttribute('role')).toBe('button'); expect(button.getAttribute('tabindex')).toBe('0');
  button.focus(); expect(document.activeElement).toBe(button);
  key(button, 'keydown', 'Enter'); key(button, 'keydown', ' '); key(button, 'keyup', ' '); await tick();
  for (const channel of ['click', 'render', 'capture', 'ancestor']) expect(calls()[channel]).toBe(2);
});
it('B:78 custom keyboard modifier state', async () => {
  const button = await setup('modifier'); button.focus(); expect(document.activeElement).toBe(button);
  button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true, cancelable: true })); await tick();
  expect(calls().click).toBe(1); expect(JSON.parse(document.querySelector('[data-testid=clicks]')!.textContent!)[0].shiftKey).toBe(true);
});
for (const scenario of ['native-disabled', 'custom-disabled', 'native-focusable', 'custom-focusable']) it(`B:100/135/175/284 disabled guards (${scenario})`, async () => {
  const button = await setup(scenario);
  expect(button.hasAttribute('disabled')).toBe(scenario === 'native-disabled'); expect(button.hasAttribute('data-disabled')).toBe(true);
  if (scenario === 'native-disabled') expect(button.hasAttribute('aria-disabled')).toBe(false);
  else expect(button.getAttribute('aria-disabled')).toBe('true');
  if (scenario !== 'native-disabled') expect(button.getAttribute('tabindex')).toBe(scenario.includes('focusable') ? '0' : '-1');
  button.click(); button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); button.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true })); key(button, 'keydown', ' '); key(button, 'keyup', ' '); key(button, 'keydown', 'Enter'); await tick();
  for (const channel of ['click', 'mouse', 'pointer', 'keydown']) expect(calls()[channel]).toBe(0);
});
it('B:243 reactive disable preserves focus and suppresses interaction', async () => {
  const button = await setup('becomes-disabled'); button.focus(); expect(document.activeElement).toBe(button);
  button.click(); await tick(); expect(calls().click).toBe(1); expect(document.activeElement).toBe(button); expect(button.getAttribute('aria-disabled')).toBe('true');
  button.click(); key(button, 'keydown', 'Enter'); key(button, 'keydown', ' '); key(button, 'keyup', ' '); await tick(); expect(calls().click).toBe(1); expect(document.activeElement).toBe(button);
});
for (const scenario of ['cancel-base', 'cancel-enter', 'cancel-space']) it(`U:596/634/661 keyboard cancellation (${scenario})`, async () => {
  const button = await setup(scenario); button.focus(); expect(document.activeElement).toBe(button);
  if (scenario !== 'cancel-space') { key(button, 'keydown', 'Enter'); await tick(); expect(calls().click).toBe(0); }
  if (scenario !== 'cancel-enter') { key(button, 'keydown', ' '); key(button, 'keyup', ' '); await tick(); expect(calls().click).toBe(0); }
});
it('supplement: replacement retains consumer attachment and DOM ref', async () => {
  const button = await setup('attachment'); expect(button.hasAttribute('data-consumer-attached')).toBe(true); expect(calls().attached).toBe(1); expect(document.querySelector('[data-testid=ref]')!.textContent).toBe('tested-button');
  const component = mounted.pop()!;
  const snapshot = (component as unknown as { snapshot(): { calls: Record<string, number>; ref: HTMLElement | null } }).snapshot;
  await unmount(component); await tick(); expect(snapshot().calls.detached).toBe(1); expect(snapshot().ref).toBeNull();
});
it('supplement: class/style callbacks track state without replacing a focused DOM host', async () => {
  const button = await setup('becomes-disabled'); button.focus(); expect(button.className).toBe('enabled-class'); expect(button.style.opacity).toBe('1');
  button.click(); await tick(); expect(document.getElementById('tested-button')).toBe(button); expect(button.className).toBe('disabled-class'); expect(button.style.opacity).toBe('0.5'); expect(document.activeElement).toBe(button);
});
for (const scenario of ['undefined-type', 'null-type']) it(`supplement: omitted native type defaults to button; explicit ${scenario} removes type`, async () => {
  const omitted = await setup('default'); expect(omitted.getAttribute('type')).toBe('button');
  await unmount(mounted.pop()!);
  const explicit = await setup(scenario); expect(explicit.hasAttribute('type')).toBe(false); expect((explicit as HTMLButtonElement).type).toBe('submit');
});
for (const scenario of ['custom-disabled', 'native-focusable']) it(`supplement: disabled mousedown cancels default without preceding pointerdown (${scenario})`, async () => {
  const button = await setup(scenario);
  const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0, buttons: 3 });
  expect(button.dispatchEvent(event)).toBe(false); expect(event.defaultPrevented).toBe(true); await tick(); expect(calls().mouse).toBe(0);
});
