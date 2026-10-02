// Paired native reset regressions, distinct from ordinary upstream conformance declarations.
import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/InputResetObservationFixture.svelte';
import GeneralFixture from '../../../../apps/fixtures/src/lib/InputFixture.svelte';
const mounted: ReturnType<typeof mount>[] = [];
afterEach(async () => { for (const component of mounted.splice(0)) await unmount(component); vi.restoreAllMocks(); vi.useRealTimers(); document.body.replaceChildren(); });
for (const scenario of ['reassociation', 'stop-immediate', 'unrelated-old']) for (const canceled of [false, true]) for (const native of [true, false]) {
  it(`native reset observation (${native ? 'native' : 'Input'}/${scenario}/canceled=${canceled})`, async () => {
    const target = document.createElement('section'); document.body.append(target);
    mounted.push(mount(Fixture, { target, props: { native, scenario, canceled } })); await tick();
    const input = target.querySelector<HTMLInputElement>('input')!; input.value = 'edit'; input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    const reset = !canceled && scenario !== 'unrelated-old'; expect(input.value).toBe(reset ? 'seed' : 'edit');
    expect(input.form!.id).toBe(scenario === 'stop-immediate' ? 'reset-first' : 'reset-second');
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
  if (cleanup === 'settle') vi.runOnlyPendingTimers();
  else if (cleanup === 'unmount') { mounted.pop(); await unmount(component); }
  else { target.querySelectorAll<HTMLButtonElement>('button')[3].click(); await tick(); }
  expect(removed).toHaveBeenCalledWith('reset', observation![1], true);
});
