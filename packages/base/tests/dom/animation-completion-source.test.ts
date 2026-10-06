// Actual pinned completion body comparisons; synthetic animation timing earns no browser credit.
import { afterEach, expect, it, vi } from 'vitest';
import {
  flushAnimationCompletionReference as flushReact,
  mountAnimationCompletionReference,
  mountDynamicAnimationCompletionReference,
} from '../../../../apps/fixtures/src/lib/animation-completion-reference.js';
import { flushSync as flushSvelte, mount, tick, unmount } from 'svelte';
import Fixture from './AnimationCompletionOrderFixture.svelte';
import DynamicFixture from './AnimationCompletionDynamicFixture.svelte';

const cleanup: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const stop of cleanup.splice(0)) await stop();
  vi.restoreAllMocks();
  document.body.replaceChildren();
});
for (const reference of [false, true])
  for (const batch of [false, true])
    it(`${reference ? 'React reference' : 'Svelte'}: ${batch ? 'batched' : 'individual'} animation completions retain original callback commit ordering`, async () => {
      const target = document.createElement('section');
      document.body.append(target);
      let finish!: () => void;
      const finished = new Promise<void>((resolve) => {
        finish = resolve;
      });
      const seen: string[] = [];
      const trace: string[] = [];
      const actualAbort = AbortController.prototype.abort;
      vi.spyOn(AbortController.prototype, 'abort').mockImplementation(function (
        this: AbortController,
        reason?: unknown,
      ) {
        trace.push(`abort:${target.textContent}`);
        return actualAbort.call(this, reason);
      });
      function record(channel: string) {
        seen.push(channel);
        trace.push(`${channel}:${target.textContent}`);
      }
      if (reference)
        cleanup.push(mountAnimationCompletionReference(target, finished, batch, record));
      else {
        const component = mount(Fixture, { target, props: { finished, batch, record } });
        cleanup.push(() => unmount(component));
      }
      await tick();
      await new Promise((resolve) => setTimeout(resolve, 60));
      finish();
      await vi.waitFor(() => expect(target.textContent).toBe('disabled'));
      expect(seen).toEqual(batch ? ['owner', 'dependent'] : ['owner']);
      expect(trace).toEqual(
        batch
          ? ['owner:enabled', 'dependent:enabled', 'abort:disabled']
          : ['owner:enabled', 'abort:disabled'],
      );
    });
for (const reference of [false, true])
  for (const batch of [false, true])
    it(`${reference ? 'React reference' : 'Svelte'}: ${batch ? 'batched' : 'individual'} pending animation completions abort on teardown`, async () => {
      const target = document.createElement('section');
      document.body.append(target);
      let finish!: () => void;
      const finished = new Promise<void>((resolve) => {
        finish = resolve;
      });
      const seen: string[] = [];
      const stop = reference
        ? mountAnimationCompletionReference(target, finished, batch, (channel) =>
            seen.push(channel),
          )
        : (() => {
            const component = mount(Fixture, {
              target,
              props: { finished, batch, record: (channel: string) => seen.push(channel) },
            });
            return () => unmount(component);
          })();
      await tick();
      await new Promise((resolve) => setTimeout(resolve, 60));
      await stop();
      finish();
      await new Promise((resolve) => setTimeout(resolve, 30));
      expect(seen).toEqual([]);
      expect(target.childElementCount).toBe(0);
    });

// Preserve the Original policy body; native rearm policy has separate measured witnesses.
for (const reference of [true])
  for (const initialBatch of [false, true])
    it(`${reference ? 'React reference' : 'Svelte'}: changing batch ${initialBatch} to ${!initialBatch} retains the pending invocation's policy`, async () => {
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
      const record = (channel: string) => {
        seen.push(channel);
        trace.push(`${channel}:${target.querySelector('[data-status]')?.textContent}`);
      };
      let setBatch: (value: boolean) => void;
      if (reference) {
        const component = mountDynamicAnimationCompletionReference(
          target,
          finished,
          initialBatch,
          record,
          () => {
            queries++;
          },
        );
        setBatch = component.setBatch;
        cleanup.push(component.stop);
      } else {
        const component = mount(DynamicFixture, {
          target,
          props: {
            finished,
            initialBatch,
            record,
            queried: () => {
              queries++;
            },
          },
        });
        setBatch = component.setBatch;
        cleanup.push(() => unmount(component));
      }
      await vi.waitFor(() => expect(queries).toBe(2));
      (reference ? flushReact : flushSvelte)(() => setBatch(!initialBatch));
      await tick();
      await vi.waitFor(() =>
        expect(target.querySelector('[data-batch]')?.textContent).toBe(String(!initialBatch)),
      );
      expect(queries).toBe(2);
      expect(seen).toEqual([]);
      expect(trace).toEqual([]);
      finish();
      await vi.waitFor(() =>
        expect(target.querySelector('[data-status]')?.textContent).toBe('disabled'),
      );
      expect(seen).toEqual(initialBatch ? ['owner', 'dependent'] : ['owner']);
      expect(trace).toEqual(
        initialBatch
          ? ['owner:enabled', 'dependent:enabled', 'abort:disabled']
          : ['owner:enabled', 'abort:disabled'],
      );
    });
