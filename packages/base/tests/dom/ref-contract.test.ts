// Supplemental Svelte binding regressions; no upstream declaration credit.
import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from '../../../../apps/fixtures/src/lib/RefContractFixture.svelte';
const mounted: ReturnType<typeof mount>[] = [];
const kinds = [
  'element',
  'button',
  'dialog-trigger',
  'dialog-portal',
  'dialog-popup',
  'dialog-backdrop',
  'dialog-title',
  'dialog-description',
  'dialog-close',
  'toast-viewport',
  'toast-root',
  'toast-title',
  'toast-description',
  'toast-content',
  'toast-action',
  'toast-close',
];
afterEach(async () => {
  for (const app of mounted.splice(0)) await unmount(app);
  document.body.replaceChildren();
});
for (const kind of kinds)
  for (const initial of [undefined, null]) {
    it(`${kind}: initially ${initial} bind:ref publishes its host and clears on removal`, () => {
      const target = document.createElement('main');
      document.body.append(target);
      const app = mount(Fixture, { target, props: { kind, initial } });
      mounted.push(app);
      flushSync();
      const host = app.getRef();
      expect(host).toBeInstanceOf(HTMLElement);
      expect(host?.isConnected).toBe(true);
      app.hide();
      flushSync();
      expect(app.getRef()).toBeNull();
      expect(host?.isConnected).toBe(false);
    });
  }
for (const kind of ['element', 'button', 'dialog-trigger']) {
  it(`${kind}: replacement render publishes the replacement host and clears on teardown`, async () => {
    const target = document.createElement('main');
    document.body.append(target);
    const app = mount(Fixture, { target, props: { kind, custom: true } });
    flushSync();
    const host = app.getRef();
    expect(host?.tagName).toBe('SPAN');
    expect(host?.textContent).toBe('Replacement');
    await unmount(app);
    expect(app.getRef()).toBeNull();
    expect(host?.isConnected).toBe(false);
  });
}
