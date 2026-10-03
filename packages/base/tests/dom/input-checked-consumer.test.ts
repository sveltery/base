// Independent source-bound regression for review finding at f6f5b99.
// Zero ordinary Input/Field assertion credit; Base UI 1.8.0 / React 19.3.0.
import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './InputCheckedConsumerMutationFixture.svelte';
import { mountInputCheckedConsumerReference } from '../../../../apps/fixtures/src/lib/input-checked-consumer-reference.js';
const cleanups: (() => void | Promise<void>)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); document.body.replaceChildren(); });
for (const reference of [true]) for (const controlled of [false, true]) for (const initial of [false, true]) for (const mode of ['imperative', 'nested-input', 'reset']) it(`${reference ? 'React' : 'Svelte'} click consumer mutation ${mode} controlled=${controlled} initial=${initial}`, async () => {
  const target = document.createElement('section'); document.body.append(target); const observations: string[] = [];
  if (reference) { cleanups.push(mountInputCheckedConsumerReference(target, initial, controlled, mode, observations)); await new Promise(resolve => setTimeout(resolve, 25)); }
  else { const component = mount(Fixture, { target, props: { initial, controlled, mode, observations } }); cleanups.push(() => unmount(component)); await tick(); }
  const input = target.querySelector<HTMLInputElement>('input')!;
  input.click(); expect(input.checked).toBe(initial);
  await tick(); await new Promise(resolve => setTimeout(resolve, 5)); expect(input.checked).toBe(initial);
  // Imperative assignments and reset occur before the source value request reads checked.
  expect(observations).toEqual([`consumer:${!initial}`, `value:${initial}`]);
});
for (const reference of [true]) for (const mode of ['imperative', 'reset']) it(`${reference ? 'React' : 'Svelte'} uncontrolled radio preserves click consumer ${mode}`, async () => {
  const target = document.createElement('section'); document.body.append(target); const observations: string[] = [];
  if (reference) { cleanups.push(mountInputCheckedConsumerReference(target, false, false, mode, observations, 'radio')); await new Promise(resolve => setTimeout(resolve, 25)); }
  else { const component = mount(Fixture, { target, props: { initial: false, controlled: false, mode, observations, type: 'radio' } }); cleanups.push(() => unmount(component)); await tick(); }
  const input = target.querySelector<HTMLInputElement>('[data-testid=owned]')!;
  input.click(); expect(input.checked).toBe(false);
  await tick(); await new Promise(resolve => setTimeout(resolve, 5)); expect(input.checked).toBe(false);
  expect(target.querySelector<HTMLInputElement>('[data-testid=sibling]')!.checked).toBe(mode === 'reset');
  expect(observations).toEqual(['consumer:true', 'value:false']);
});

// Source callback timing/tracker expectations above remain actual React evidence.
// The port comparisons use a literal Svelte input and no ownership emulation.
for (const type of ['checkbox', 'radio'] as const) for (const controlled of [false, true]) for (const initial of [false, true]) for (const mode of ['imperative', 'nested-input', 'reset']) it(`Input matches native ${type} consumer mutation ${mode} controlled=${controlled} initial=${initial}`, async () => {
  const portHost = document.createElement('section'), nativeHost = document.createElement('section'); document.body.append(portHost, nativeHost);
  const portCalls: string[] = [], nativeCalls: string[] = [];
  const port = mount(Fixture, { target: portHost, props: { initial, controlled, mode, observations: portCalls, type } });
  const native = mount(Fixture, { target: nativeHost, props: { initial, controlled, mode, observations: nativeCalls, type, native: true } });
  cleanups.push(() => unmount(port), () => unmount(native)); await tick();
  const portInput = portHost.querySelector<HTMLInputElement>('[data-testid=owned]')!, nativeInput = nativeHost.querySelector<HTMLInputElement>('[data-testid=owned]')!;
  portInput.click(); nativeInput.click(); expect(portInput.checked).toBe(nativeInput.checked); expect(portCalls).toEqual(nativeCalls);
  await tick(); await tick(); expect(portInput.checked).toBe(nativeInput.checked); expect(portCalls).toEqual(nativeCalls);
  if (type === 'radio') expect(portHost.querySelector<HTMLInputElement>('[data-testid=sibling]')!.checked).toBe(nativeHost.querySelector<HTMLInputElement>('[data-testid=sibling]')!.checked);
});
