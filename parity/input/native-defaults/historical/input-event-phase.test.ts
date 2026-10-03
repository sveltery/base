// Explicit active-phase branch/cleanup regressions; trusted Chromium traces are the native ordering evidence.
import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/InputFixture.svelte';
const mounted: ReturnType<typeof mount>[] = [];
afterEach(async () => { for (const component of mounted.splice(0)) await unmount(component); vi.restoreAllMocks(); vi.useRealTimers(); document.body.replaceChildren(); });
async function setup(scenario = 'controlled-reject') {
  vi.useFakeTimers(); const target = document.createElement('section'); document.body.append(target);
  const component = mount(Fixture, { target, props: { scenario } }); mounted.push(component); await tick();
  vi.runOnlyPendingTimers(); await tick();
  return { target, component, input: target.querySelector<HTMLInputElement>('[data-testid=input]')!, scheduled: vi.spyOn(window, 'setTimeout'), cleared: vi.spyOn(window, 'clearTimeout') };
}
async function edit(input: HTMLInputElement, next: string) {
  input.value = next; const event = new InputEvent('input', { bubbles: true });
  // jsdom dispatch finishes before tick; keep this explicit branch simulation separate from browser proof.
  Object.defineProperty(event, 'eventPhase', { value: Event.AT_TARGET }); input.dispatchEvent(event); await tick(); await tick();
}
it('active-phase edits wait for a task, coalesce, and read the latest owner', async () => {
  const { input, target, scheduled, cleared } = await setup();
  await edit(input, 'first'); expect(input.value).toBe('first');
  const restoreIndex = scheduled.mock.calls.findIndex(([, delay]) => delay === 0); expect(restoreIndex).toBeGreaterThanOrEqual(0);
  const firstTimer = scheduled.mock.results[restoreIndex].value;
  await edit(input, 'second'); expect(input.value).toBe('second'); expect(cleared).toHaveBeenCalledWith(firstTimer);
  expect(scheduled.mock.calls.filter(([, delay]) => delay === 0)).toHaveLength(2);
  target.querySelector<HTMLButtonElement>('button:not([type])')!.click(); await tick(); input.value = 'stale';
  vi.runOnlyPendingTimers(); expect(input.value).toBe('programmatic');
});
it('unmount cancels pending restoration without writing the detached host', async () => {
  const { input, component, scheduled, cleared } = await setup(); await edit(input, 'edit');
  const timer = scheduled.mock.results[scheduled.mock.calls.findIndex(([, delay]) => delay === 0)].value;
  mounted.pop(); await unmount(component); expect(cleared).toHaveBeenCalledWith(timer); vi.runOnlyPendingTimers(); expect(input.value).toBe('edit');
});
it('host replacement cancels the old task and leaves the new host alone', async () => {
  const { input, target, scheduled, cleared } = await setup(); await edit(input, 'edit');
  const timer = scheduled.mock.results[scheduled.mock.calls.findIndex(([, delay]) => delay === 0)].value;
  target.querySelectorAll<HTMLButtonElement>('button')[3].click(); await tick(); const replacement = target.querySelector<HTMLTextAreaElement>('[data-testid=input]')!;
  replacement.value = 'new edit'; expect(cleared).toHaveBeenCalledWith(timer); vi.runOnlyPendingTimers(); expect(input.value).toBe('edit'); expect(replacement.value).toBe('new edit');
});
it('an uncontrolled canceled edit schedules no restoration', async () => {
  const { input, scheduled } = await setup('cancel'); await edit(input, 'edit'); expect(scheduled.mock.calls.filter(([, delay]) => delay === 0)).toHaveLength(0); expect(input.value).toBe('edit');
});
for (const canceled of [false, true]) it(`same-dispatch reset keeps the native default unless canceled (canceled=${canceled})`, async () => {
  const { input } = await setup(`controlled-default-reset-in-input${canceled ? '-cancel' : ''}`); await edit(input, 'edit');
  expect(input.value).toBe(canceled ? 'edit' : 'seed'); vi.runOnlyPendingTimers(); expect(input.value).toBe(canceled ? 'owner' : 'seed');
});
