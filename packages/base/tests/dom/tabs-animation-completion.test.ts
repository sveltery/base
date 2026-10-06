// Source's selected queue/abort policy, exercised through the actual native helper and DOM teardown.
// Native supplements only; the canonical owner separately records paired actual Source vectors. MIT.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './TabsAnimationCompletionFixture.svelte';
const cleanups: Array<() => Promise<void>> = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  vi.useRealTimers();
  document.body.replaceChildren();
});
async function setup(firstBatch: boolean, secondBatch: boolean) {
  vi.useFakeTimers();
  const host = document.createElement('div');
  document.body.append(host);
  let finish!: () => void;
  const finished = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const component = mount(Fixture, { target: host, props: { finished, firstBatch, secondBatch } });
  let mounted = true;
  const dispose = async () => {
    if (mounted) {
      mounted = false;
      await unmount(component);
    }
  };
  cleanups.push(dispose);
  flushSync();
  await tick();
  await vi.advanceTimersByTimeAsync(20);
  async function complete() {
    finish();
    for (let index = 0; index < 5; index++) await Promise.resolve();
    flushSync();
    await tick();
  }
  return { component, host, complete, dispose };
}
for (const [first, second, expected] of [
  [false, false, ['first']],
  [true, true, ['first', 'second']],
  [false, true, ['first']],
  [true, false, ['second', 'first']],
] as const) {
  it(`native Tabs used-helper completion order and abort cleanup ${first}/${second}`, async () => {
    const fixture = await setup(first, second);
    await fixture.complete();
    expect(fixture.component.getCalls()).toEqual(expected);
    expect(fixture.host.querySelectorAll('div')).toHaveLength(1);
  });
}
it('native Tabs used-helper unmount aborts pending completions and clears DOM', async () => {
  const fixture = await setup(true, false);
  await fixture.dispose();
  await fixture.complete();
  expect(fixture.component.getCalls()).toEqual([]);
  expect(fixture.host.children).toHaveLength(0);
});
