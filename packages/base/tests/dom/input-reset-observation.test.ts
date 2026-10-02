// Paired native reset regressions, distinct from ordinary upstream conformance declarations.
import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/InputResetObservationFixture.svelte';
import GeneralFixture from '../../../../apps/fixtures/src/lib/InputFixture.svelte';
const mounted: ReturnType<typeof mount>[] = [];
afterEach(async () => { for (const component of mounted.splice(0)) await unmount(component); vi.restoreAllMocks(); vi.useRealTimers(); document.body.replaceChildren(); });
for (const scenario of ['reassociation', 'stop-immediate', 'unrelated-old', 'attachment-bubble', 'attachment-capture', 'attachment-bubble-replacement', 'attachment-capture-replacement', 'render-attachment-bubble-before', 'render-attachment-capture-before', 'reassociation-during-reset', 'reassociation-after-reset', 'reassociation-into-reset', 'reassociation-during-reset-stop', 'reassociation-after-reset-stop', 'reassociation-into-reset-stop']) for (const canceled of [false, true]) for (const native of [true, false]) {
  it(`native reset observation (${native ? 'native' : 'Input'}/${scenario}/canceled=${canceled})`, async () => {
    const target = document.createElement('section'); document.body.append(target);
    mounted.push(mount(Fixture, { target, props: { native, scenario, canceled } })); await tick();
    const input = target.querySelector<HTMLInputElement>('input')!; input.value = 'edit'; input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    const reset = !canceled && scenario !== 'unrelated-old' && !scenario.startsWith('reassociation-during-reset'); expect(input.value).toBe(reset ? 'seed' : 'edit');
    expect(input.form!.id).toBe(scenario === 'stop-immediate' || scenario.includes('attachment-') || scenario.startsWith('reassociation-into-reset') ? 'reset-first' : 'reset-second');
    if (!native && scenario.endsWith('-replacement')) expect(input.dataset.merged).toBe('true');
    await tick(); await tick(); expect(input.value).toBe(reset ? 'seed' : native ? 'edit' : 'owner');
  });
}
for (const cleanup of ['settle', 'unmount', 'replace']) it(`transient capture reset observer is removed on ${cleanup}`, async () => {
  vi.useFakeTimers(); const target = document.createElement('section'); document.body.append(target);
  const component = mount(GeneralFixture, { target, props: { scenario: 'controlled-reject' } }); mounted.push(component); await tick();
  const added = vi.spyOn(document, 'addEventListener'); const removed = vi.spyOn(document, 'removeEventListener');
  const input = target.querySelector<HTMLInputElement>('input')!; input.value = 'edit';
  const event = new InputEvent('input', { bubbles: true }); Object.defineProperty(event, 'eventPhase', { value: Event.AT_TARGET });
  input.dispatchEvent(event); await tick(); await tick();
  const observation = added.mock.calls.find(([name, , capture]) => name === 'reset' && capture === true); expect(observation).toBeDefined();
  const bubbleObservation = added.mock.calls.find(([name, , capture]) => name === 'reset' && capture === undefined); expect(bubbleObservation).toBeDefined();
  if (cleanup === 'settle') vi.runOnlyPendingTimers();
  else if (cleanup === 'unmount') { mounted.pop(); await unmount(component); }
  else { target.querySelectorAll<HTMLButtonElement>('button')[3].click(); await tick(); }
  expect(removed).toHaveBeenCalledWith('reset', observation![1], true);
  expect(removed).toHaveBeenCalledWith('reset', bubbleObservation![1]);
});
for (const cleanup of ['unmount', 'replace']) it(`host-parent input capture is removed on ${cleanup}`, async () => {
  const added = vi.spyOn(EventTarget.prototype, 'addEventListener'); const removed = vi.spyOn(EventTarget.prototype, 'removeEventListener');
  const target = document.createElement('section'); document.body.append(target);
  const component = mount(GeneralFixture, { target, props: { scenario: 'controlled-reject' } }); mounted.push(component); await tick();
  const input = target.querySelector<HTMLInputElement>('input')!; const parent = input.parentNode!;
  const index = added.mock.calls.findIndex(([name, , capture], index) => name === 'input' && capture === true && added.mock.contexts[index] === parent); expect(index).toBeGreaterThanOrEqual(0);
  const listener = added.mock.calls[index][1];
  if (cleanup === 'unmount') { mounted.pop(); await unmount(component); }
  else { target.querySelectorAll<HTMLButtonElement>('button')[3].click(); await tick(); }
  expect(removed.mock.calls.some(([name, callback, capture], index) => name === 'input' && callback === listener && capture === true && removed.mock.contexts[index] === parent)).toBe(true);
});
it('parent capture ignores sibling input events', async () => {
  const target = document.createElement('section'); document.body.append(target);
  mounted.push(mount(Fixture, { target, props: { scenario: 'render-attachment-capture-before', sibling: true } })); await tick();
  const input = target.querySelector<HTMLInputElement>('[data-testid=reset-input]')!; const sibling = target.querySelector<HTMLInputElement>('[data-testid=reset-sibling]')!;
  input.value = 'edit'; input.dispatchEvent(new InputEvent('input', { bubbles: true }));
  // A sibling edit during pending reset restoration must not clear this host's reset record.
  sibling.value = 'sibling edit'; sibling.dispatchEvent(new InputEvent('input', { bubbles: true })); await tick(); await tick();
  expect(input.value).toBe('seed'); expect(sibling.value).toBe('other-owner');
});
for (const native of [true, false]) it(`target attachment reset inside a shadow root (${native ? 'native' : 'Input'})`, async () => {
  const host = document.createElement('section'); document.body.append(host); const target = host.attachShadow({ mode: 'open' });
  mounted.push(mount(Fixture, { target, props: { native, scenario: 'render-attachment-capture-before' } })); await tick();
  const input = target.querySelector<HTMLInputElement>('input')!; input.value = 'edit'; input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true })); await tick(); await tick();
  expect(input.value).toBe('seed');
});
