// Actual ScrollArea axis ownership regression; supplemental native credit only.
import { expect, it } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './NativeScrollAreaAxisFixture.svelte';

it('moves retained Scrollbar and Thumb hosts between live axis registries and clears them on teardown', async () => {
  const target = document.createElement('main');
  document.body.append(target);
  const app = mount(Fixture, { target });
  flushSync();
  await tick();
  try {
    const scrollbar = target.querySelector<HTMLElement>('#native-scrollbar')!;
    const thumb = target.querySelector<HTMLElement>('#native-thumb')!;
    expect(app.snapshot()).toEqual({
      scrollbar,
      thumb,
      x: null,
      y: scrollbar,
      thumbX: null,
      thumbY: thumb,
    });
    app.setOrientation('horizontal');
    flushSync();
    await tick();
    expect(target.querySelector('#native-scrollbar')).toBe(scrollbar);
    expect(target.querySelector('#native-thumb')).toBe(thumb);
    expect(app.snapshot()).toEqual({
      scrollbar,
      thumb,
      x: scrollbar,
      y: null,
      thumbX: thumb,
      thumbY: null,
    });
    expect(scrollbar.getAttribute('data-orientation')).toBe('horizontal');
    expect(thumb.getAttribute('data-orientation')).toBe('horizontal');
    app.setOrientation('vertical');
    flushSync();
    await tick();
    expect(app.snapshot()).toEqual({
      scrollbar,
      thumb,
      x: null,
      y: scrollbar,
      thumbX: null,
      thumbY: thumb,
    });
    app.hide();
    flushSync();
    await tick();
    expect(app.snapshot()).toEqual({
      scrollbar: null,
      thumb: null,
      x: null,
      y: null,
      thumbX: null,
      thumbY: null,
    });
  } finally {
    await unmount(app);
    target.remove();
  }
});
