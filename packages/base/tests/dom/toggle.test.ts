// Toggle direct assertion companions and supplemental probes. MIT: parity/toggle/UPSTREAM_LICENSE.
import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/ToggleFixture.svelte';
const mounted: ReturnType<typeof mount>[] = [];
async function setup(scenario: string) {
  const target = document.createElement('section'); document.body.append(target);
  const component = mount(Fixture, { target, props: { scenario } }); mounted.push(component); await tick();
  return { button: document.getElementById('tested-toggle')!, component };
}
function calls() { return JSON.parse(document.querySelector('[data-testid=calls]')!.textContent!) as { pressed: boolean; before: string; reason: string; canceled: boolean; defaultPrevented: boolean }[]; }
async function action(name: string) { (Array.from(document.querySelectorAll('button')).find(node => node.textContent === name)!).click(); await tick(); }
afterEach(async () => { for (const component of mounted.splice(0)) await unmount(component); document.body.replaceChildren(); });
it('T:19 controlled', async () => {
  const { button } = await setup('controlled'); const owner = document.querySelector('input[type=checkbox]') as HTMLInputElement;
  expect(button.getAttribute('aria-pressed')).toBe('false'); owner.click(); await tick(); expect(button.getAttribute('aria-pressed')).toBe('true');
  owner.click(); await tick(); expect(button.getAttribute('aria-pressed')).toBe('false');
});
it('T:48 uncontrolled', async () => {
  const { button } = await setup('uncontrolled'); expect(button.getAttribute('aria-pressed')).toBe('false');
  button.click(); await tick(); expect(button.getAttribute('aria-pressed')).toBe('true');
  button.click(); await tick(); expect(button.getAttribute('aria-pressed')).toBe('false');
});
it('T:69 is called when the pressed state changes', async () => {
  const { button } = await setup('callback'); button.click(); await tick(); expect(calls().length).toBe(1); expect(calls()[0].pressed).toBe(true);
});
it('T:84 does not change the pressed state when the event is canceled', async () => {
  const { button } = await setup('cancel'); button.click(); await tick(); expect(button.getAttribute('aria-pressed')).toBe('false');
});
it('T:130 disables the component', async () => {
  const { button } = await setup('disabled'); expect(button.hasAttribute('disabled')).toBe(true); expect(button.hasAttribute('data-disabled')).toBe(true);
  expect(button.getAttribute('aria-pressed')).toBe('false'); button.click(); await tick(); expect(calls().length).toBe(0); expect(button.getAttribute('aria-pressed')).toBe('false');
});
it('supplement: owner must accept controlled requests and callback observes old state', async () => {
  const { button } = await setup('controlled'); button.click(); await tick(); expect(button.getAttribute('aria-pressed')).toBe('false');
  expect(calls()[0]).toMatchObject({ pressed: true, before: 'false', reason: 'none' });
});
for (const scenario of ['cancel', 'click-cancel', 'click-default', 'render-cancel', 'render-order']) it(`supplement: ${scenario} channels`, async () => {
  const { button } = await setup(scenario); button.click(); await tick();
  expect(button.getAttribute('aria-pressed')).toBe(String(['click-default', 'render-order'].includes(scenario)));
  expect(calls().length).toBe(['click-cancel', 'render-cancel'].includes(scenario) ? 0 : 1);
  if (scenario === 'cancel') expect(calls()[0]).toMatchObject({ canceled: true, defaultPrevented: false });
  if (scenario === 'click-default') expect(calls()[0].defaultPrevented).toBe(true);
  if (scenario === 'render-order') expect(JSON.parse(document.querySelector('[data-testid=order]')!.textContent!)).toEqual(['render', 'consumer', 'change', 'ancestor']);
});
it('supplement: controlled fallback and fixed default match pinned helper', async () => {
  const { button } = await setup('controlled-fallback'); await action('Change default'); await action('Clear controlled prop');
  expect(button.getAttribute('aria-pressed')).toBe('true'); button.click(); await tick(); expect(button.getAttribute('aria-pressed')).toBe('true');
});
it('supplement: initially uncontrolled ignores a later controlled prop and changed default', async () => {
  const { button } = await setup('uncontrolled'); await action('Change default'); (document.querySelector('input[type=checkbox]') as HTMLInputElement).click(); await tick();
  expect(button.getAttribute('aria-pressed')).toBe('false'); button.click(); await tick(); expect(button.getAttribute('aria-pressed')).toBe('true');
});
it('supplement: native reset preserves pressed state and stripped type cannot reset', async () => {
  const { button } = await setup('stripped-reset'); const input = document.querySelector('input[aria-label="Reset field"]') as HTMLInputElement;
  expect(button.getAttribute('type')).toBe('button'); input.value = 'changed'; button.click(); await tick(); expect(input.value).toBe('changed');
  await action('Native reset'); expect(input.value).toBe('initial'); expect(button.getAttribute('aria-pressed')).toBe('true');
});
it('supplement: actual replacement ref and attachment survive state change then clean up', async () => {
  const { button, component } = await setup('attachment'); expect(button.tagName).toBe('SPAN'); expect(button.hasAttribute('data-consumer-attached')).toBe(true);
  expect(component.snapshot()).toEqual({ ref: button, attached: 1, detached: 0 }); button.focus(); button.click(); await tick();
  expect(document.getElementById('tested-toggle')).toBe(button); expect(document.activeElement).toBe(button); expect(button.className).toBe('pressed-class');
  await action('Toggle mounting'); expect(component.snapshot()).toEqual({ ref: null, attached: 1, detached: 1 });
  await action('Toggle mounting'); expect(document.getElementById('tested-toggle')!.getAttribute('aria-pressed')).toBe('false');
});
it('source audit supplement: canonical disabled mousedown retains native default', async () => {
  const { button } = await setup('custom-disabled'); const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true, buttons: 3 });
  expect(button.dispatchEvent(event)).toBe(true); expect(event.defaultPrevented).toBe(false);
  button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); button.click(); await tick(); expect(calls()).toEqual([]);
});
for (const scenario of ['non-native-default', 'non-native-stripped']) it(`supplement: ${scenario} native host still defaults to type=button`, async () => {
  const { button } = await setup(scenario);
  expect(button.tagName).toBe('BUTTON'); expect(button.getAttribute('type')).toBe('button');
  expect(button.getAttribute('role')).toBe('button'); expect(button.hasAttribute('form')).toBe(false); expect(button.hasAttribute('value')).toBe(false);
  button.click(); await tick(); expect(calls().length).toBe(1); expect(button.getAttribute('aria-pressed')).toBe('true');
  expect(JSON.parse(document.querySelector('[data-testid=forms]')!.textContent!)).toEqual({ submitted: 0, reset: 0 });
});
for (const scenario of ['controlled-consumer', 'controlled-render']) it(`supplement: ${scenario} uses native live state after consumer writes`, async () => {
  const { button } = await setup(scenario); button.click(); await tick();
  expect(calls().map(call => call.pressed)).toEqual([false]); expect(button.getAttribute('aria-pressed')).toBe('false');
  button.click(); await tick(); expect(calls().map(call => call.pressed)).toEqual([false, false]); expect(button.getAttribute('aria-pressed')).toBe('false');
});
it('supplement: same-turn uncontrolled clicks read native live state', async () => {
  const { button } = await setup('uncontrolled'); button.click(); button.click(); await tick();
  expect(calls().map(call => call.pressed)).toEqual([true, false]); expect(button.getAttribute('aria-pressed')).toBe('false');
  button.click(); await tick(); expect(calls().map(call => call.pressed)).toEqual([true, false, true]); expect(button.getAttribute('aria-pressed')).toBe('true');
});

for (const scenario of ['callback-consumer', 'callback-render']) it(`supplement: ${scenario} reads native live callback replacement`, async () => {
  const { button } = await setup(scenario); button.click(); await tick();
  expect(JSON.parse(document.querySelector('[data-testid=callback-owners]')!.textContent!)).toEqual(['new']);
  expect(button.getAttribute('aria-pressed')).toBe('true');
  button.click(); await tick();
  expect(JSON.parse(document.querySelector('[data-testid=callback-owners]')!.textContent!)).toEqual(['new', 'new']);
  expect(calls().map(call => call.pressed)).toEqual([true, false]); expect(button.getAttribute('aria-pressed')).toBe('false');
});

// Literal native Svelte state/closure behavior verifies the audit expectations.
import NativeTimingFixture from './NativeToggleTimingFixture.svelte';
for (const scenario of ['controlled-consumer', 'controlled-render', 'callback-consumer', 'callback-render', 'uncontrolled']) it(`native witness: literal Svelte ${scenario} live timing`, async () => {
  const target = document.createElement('section'); document.body.append(target);
  const component = mount(NativeTimingFixture, { target, props: { scenario } }); mounted.push(component); await tick();
  const button = document.getElementById('literal-toggle')!; button.click(); button.click(); await tick();
  expect(JSON.parse(document.getElementById('literal-values')!.textContent!)).toEqual(scenario.startsWith('controlled') ? [false, false] : [true, false]);
  if (scenario.startsWith('callback')) expect(JSON.parse(document.getElementById('literal-owners')!.textContent!)).toEqual(['new', 'new']);
});
