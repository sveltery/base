import { expect, it } from 'vitest';
import { mount, flushSync, tick, unmount } from 'svelte';
import Fixture from './slider-label.svelte';

it('Slider label cleanup resolves the Source updater against newer label ownership', async () => {
  const host = document.createElement('main');
  document.body.append(host);
  const app = mount(Fixture, { target: host });
  flushSync();
  await tick();
  const assertLabel = (id: string | null) => {
    expect(host.firstElementChild?.getAttribute('aria-labelledby')).toBe(id);
    expect(host.querySelector('input')?.getAttribute('aria-labelledby')).toBe(id);
  };
  assertLabel('label-slider-label');
  app.replaceId();
  flushSync();
  await tick();
  assertLabel('replacement-slider-label');
  app.showNewer();
  flushSync();
  await tick();
  assertLabel('newer-label');
  app.hideOriginal();
  flushSync();
  await tick();
  assertLabel('newer-label');
  app.hideNewer();
  flushSync();
  await tick();
  assertLabel(null);
  await unmount(app);
  expect(host.childElementCount).toBe(0);
  host.remove();
});
