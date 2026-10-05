// Four actual Original/native ownership equality regressions, zero declaration credit.
import { afterEach, expect, it, vi } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Native from './PopupDelayGroupOwnershipFixture.svelte';
import { mountOriginalDelayOwnership, advanceOriginalDelayTime } from './popup-delay-group-source.js';

const disposals: (() => Promise<void> | void)[] = [];
afterEach(async () => {
  for (const dispose of disposals.splice(0)) await dispose();
  vi.useRealTimers(); document.body.replaceChildren();
});
async function setup(closedSecond = false) {
  const sourceTarget = document.createElement('main'); const nativeTarget = document.createElement('main');
  document.body.append(sourceTarget, nativeTarget);
  const original = await mountOriginalDelayOwnership(sourceTarget, closedSecond);
  const local = mount(Native, { target: nativeTarget, props: { closedSecond } }); await tick();
  disposals.push(original.stop, () => unmount(local));
  return { original, local };
}
for (const transition of ['changeId', 'switchStore'] as const) {
  it(`canonical root Store ${transition} preserves Source ownership`, async () => {
    const { original, local } = await setup();
    expect(local.read()).toEqual(original.read());
    await original[transition](); local[transition](); await tick();
    expect(original.read()).toEqual({ activeId: 'two', instant: false, requests: [] });
    expect(local.read()).toEqual(original.read());
  });
}
it('pending group timer reads the Store that scheduled it after closed-context handoff', async () => {
  vi.useFakeTimers(); const { original, local } = await setup(true);
  await original.closeFirst(); local.closeFirst(); await tick();
  await original.switchStore(); local.switchStore(); await tick();
  await original.reopenFirst(); local.reopenFirst(); await tick();
  await advanceOriginalDelayTime(() => vi.advanceTimersByTime(500)); await tick();
  expect(original.read()).toEqual({ activeId: 'one', instant: false, requests: [] });
  expect(local.read()).toEqual(original.read());
});
it('simultaneous ID replacement and close releases the previous open owner', async () => {
  const { original, local } = await setup(true);
  await original.changeIdAndClose(); local.changeId(); local.closeFirst(); await tick();
  expect(original.read()).toEqual({ activeId: null, instant: false, requests: [] });
  expect(local.read()).toEqual(original.read());
});
