// Native ref transport/lifetime supplement; no unchanged upstream declaration credit.
import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './ForwardedNativeRefFixture.svelte';
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  document.body.replaceChildren();
});
it('forwarded refs share source order, return cleanups and bound elements while authored attachments retain native reactivity', async () => {
  const host = document.createElement('main');
  document.body.append(host);
  const events: string[] = [];
  const app = mount(Fixture, { target: host, props: { events } });
  cleanups.push(() => unmount(app));
  flushSync();
  const button = host.querySelector('button')!;
  expect(app.getElements()).toEqual([button, button]);
  const sourceEvents = () => events.filter((event) => !event.startsWith('authored'));
  expect(sourceEvents()).toEqual(['inner attach 0', 'outer attach']);
  expect(events.filter((event) => event.startsWith('authored'))).toEqual(['authored attach 0']);
  app.updateAuthored();
  flushSync();
  expect(sourceEvents()).toEqual(['inner attach 0', 'outer attach']);
  expect(events.filter((event) => event.startsWith('authored'))).toEqual([
    'authored attach 0',
    'authored cleanup 0',
    'authored attach 1',
  ]);
  app.updateInner();
  flushSync();
  expect(host.querySelector('button')).toBe(button);
  expect(app.getElements()).toEqual([button, button]);
  expect(sourceEvents()).toEqual([
    'inner attach 0',
    'outer attach',
    'inner cleanup 0',
    'outer cleanup',
    'inner attach 1',
    'outer attach',
  ]);
  expect(events.filter((event) => event.startsWith('authored'))).toEqual([
    'authored attach 0',
    'authored cleanup 0',
    'authored attach 1',
  ]);
  app.hide();
  flushSync();
  expect(button.isConnected).toBe(false);
  expect(app.getElements()).toEqual([null, null]);
  expect(sourceEvents().slice(-2)).toEqual(['inner cleanup 1', 'outer cleanup']);
  expect(events.filter((event) => event === 'authored cleanup 1')).toHaveLength(1);
});
