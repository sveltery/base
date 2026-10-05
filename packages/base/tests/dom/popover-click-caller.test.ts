// Literal real Original/native caller transport supplement; no ordinary assertion credit.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './PopoverClickCallerFixture.svelte';
import { mountPopoverClickCallerReference } from '../../../../apps/fixtures/src/lib/popover-click-caller-reference.js';
const cleanup: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const stop of cleanup.splice(0)) await stop();
  vi.useRealTimers();
  document.body.replaceChildren();
});
for (const model of ['original', 'native'] as const)
  it(`${model}: real Trigger callback keeps its selected Root when an earlier composed handler switches handle`, async () => {
    vi.useFakeTimers();
    const target = document.createElement('section');
    document.body.append(target);
    let snapshot: () => { owner: string; open: boolean }[];
    if (model === 'original') {
      const fixture = mountPopoverClickCallerReference(target);
      snapshot = fixture.snapshot;
      cleanup.push(fixture.stop);
    } else {
      const fixture = mount(Fixture, { target });
      snapshot = fixture.snapshot;
      cleanup.push(() => unmount(fixture));
    }
    flushSync();
    await tick();
    await vi.advanceTimersByTimeAsync(50);
    flushSync(() =>
      document
        .getElementById('caller-trigger')!
        .dispatchEvent(new MouseEvent('click', { bubbles: true })),
    );
    await tick();
    await vi.advanceTimersByTimeAsync(50);
    expect(snapshot().filter((change) => change.open)).toEqual([{ owner: 'first', open: true }]);
    expect(document.querySelector('[data-testid=first-popup]')).not.toBeNull();
    expect(document.querySelector('[data-testid=second-popup]')).toBeNull();
  });
