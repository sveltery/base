// Authored native policy witnesses; zero unchanged Original assertion/browser credit.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import AnimationFixture from './AnimationCompletionDynamicFixture.svelte';
import AvatarFixture from './AvatarCompletionDynamicFixture.svelte';

const mounted: ReturnType<typeof mount>[] = [];
afterEach(async () => {
  await Promise.all(mounted.splice(0).map((component) => unmount(component)));
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

for (const [name, Fixture] of [
  ['animation', AnimationFixture],
  ['Avatar', AvatarFixture],
] as const)
  for (const initialBatch of [false, true])
    it(`${name}: native batch ${initialBatch} to ${!initialBatch} aborts old watchers and uses the rearmed completion policy`, async () => {
      const target = document.createElement('section');
      document.body.append(target);
      let finish!: () => void;
      const finished = new Promise<void>((resolve) => {
        finish = resolve;
      });
      const seen: string[] = [];
      const trace: string[] = [];
      let queries = 0;
      const actualAbort = AbortController.prototype.abort;
      vi.spyOn(AbortController.prototype, 'abort').mockImplementation(function (
        this: AbortController,
        reason?: unknown,
      ) {
        trace.push(`abort:${target.querySelector('[data-status]')?.textContent}`);
        return actualAbort.call(this, reason);
      });
      const component = mount(Fixture, {
        target,
        props: {
          finished,
          initialBatch,
          record(channel: string) {
            seen.push(channel);
            trace.push(`${channel}:${target.querySelector('[data-status]')?.textContent}`);
          },
          queried() {
            queries += 1;
          },
        },
      });
      mounted.push(component);
      await vi.waitFor(() => expect(queries).toBe(2));
      flushSync(() => component.setBatch(!initialBatch));
      await tick();
      expect(seen).toEqual([]);
      expect(trace).toEqual(['abort:enabled', 'abort:enabled']);
      await vi.waitFor(() => expect(queries).toBe(4));
      finish();
      await vi.waitFor(() =>
        expect(target.querySelector('[data-status]')?.textContent).toBe('disabled'),
      );
      expect(seen).toEqual(initialBatch ? ['owner'] : ['owner', 'dependent']);
      expect(trace).toEqual(
        initialBatch
          ? ['abort:enabled', 'abort:enabled', 'owner:enabled', 'abort:disabled']
          : [
              'abort:enabled',
              'abort:enabled',
              'owner:enabled',
              'dependent:enabled',
              'abort:disabled',
            ],
      );
    });
