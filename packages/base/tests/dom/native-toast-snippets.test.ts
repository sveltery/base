// Bounded real Toast render API acceptance; no swipe or unchanged React rendering credit.
import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import Fixture from './NativeToastSnippetFixture.svelte';
const mounted: ReturnType<typeof mount>[] = [];
afterEach(async () => {
  for (const app of mounted.splice(0)) await unmount(app);
  document.body.replaceChildren();
});
for (const custom of [false, true])
  it(`uses actual ${custom ? 'snippet' : 'intrinsic'} Toast hosts and resolved action/title/description content`, async () => {
    const target = document.createElement('main');
    document.body.append(target);
    const app = mount(Fixture, { target, props: { custom } });
    mounted.push(app);
    flushSync();
    await tick();
    flushSync();
    const snapshot = app.snapshot();
    for (const part of [
      'viewport',
      'root',
      'content',
      'title',
      'description',
      'action',
      'close',
    ] as const) {
      expect(snapshot[part]).toBe(
        target.querySelector(`#native-toast-${part}`),
      );
      if (custom)
        expect(snapshot[part]?.classList.contains('owned-toast')).toBe(true);
    }
    expect(snapshot.title?.textContent).toBe('Toast title');
    expect(snapshot.description?.textContent).toBe('Toast description');
    expect(snapshot.action?.textContent).toBe('From toast');
    expect(snapshot.close?.textContent).toBe('Close toast');
    expect(snapshot.action?.tagName).toBe('BUTTON');
    expect(snapshot.action?.getAttribute('type')).toBe('button');
    expect(snapshot.root?.getAttribute('aria-labelledby')).toBe(
      'native-toast-title',
    );
    expect(snapshot.root?.getAttribute('aria-describedby')).toBe(
      'native-toast-description',
    );
    if (custom) {
      expect(snapshot.root?.tagName).toBe('SECTION');
      expect(snapshot.title?.tagName).toBe('H4');
      const action = snapshot.received.find(
        (record) => record.id === 'native-toast-action',
      );
      expect(action?.state).toEqual({ type: 'success' });
      expect(typeof action?.children).toBe('function');
    }
    app.hide();
    flushSync();
    await tick();
    const cleared = app.snapshot();
    for (const part of [
      'viewport',
      'root',
      'content',
      'title',
      'description',
      'action',
      'close',
    ] as const)
      expect(cleared[part]).toBeNull();
  });

for (const part of ['action', 'close'] as const) {
  for (const activation of ['Enter', ' '] as const)
    it(`activates a real nonbutton Toast.${part} through ${activation === ' ' ? 'Space keyup' : 'Enter keydown'}`, async () => {
      const target = document.createElement('main');
      document.body.append(target);
      const app = mount(Fixture, { target, props: { nonButton: true } });
      mounted.push(app);
      flushSync();
      await tick();
      const host = app.snapshot()[part]!;
      expect(host.tagName).toBe('SPAN');
      expect(host.getAttribute('role')).toBe('button');
      expect(host.tabIndex).toBe(0);
      host.focus();
      host.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: activation,
          bubbles: true,
          cancelable: true,
        }),
      );
      flushSync();
      const clickCalls = () =>
        app.snapshot().calls.filter((call) => !call.startsWith('key:'));
      expect(clickCalls()).toEqual(
        activation === ' '
          ? []
          : part === 'action'
            ? ['action:toast', 'action:component']
            : ['close:component'],
      );
      host.dispatchEvent(
        new KeyboardEvent('keyup', {
          key: activation,
          bubbles: true,
          cancelable: true,
        }),
      );
      flushSync();
      expect(clickCalls()).toEqual(
        part === 'action'
          ? ['action:toast', 'action:component']
          : ['close:component'],
      );
      expect(document.activeElement).toBe(host);
    });
  for (const prevention of ['default', 'base'] as const)
    it(`honors ${prevention} keyboard cancellation on a native Toast.${part} snippet`, async () => {
      const target = document.createElement('main');
      document.body.append(target);
      const app = mount(Fixture, {
        target,
        props: { nonButton: true, prevention },
      });
      mounted.push(app);
      flushSync();
      await tick();
      const host = app.snapshot()[part]!;
      for (const activation of ['Enter', ' ']) {
        host.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: activation,
            bubbles: true,
            cancelable: true,
          }),
        );
        host.dispatchEvent(
          new KeyboardEvent('keyup', {
            key: activation,
            bubbles: true,
            cancelable: true,
          }),
        );
      }
      flushSync();
      expect(
        app.snapshot().calls.filter((call) => !call.startsWith('key:')),
      ).toEqual([]);
    });
  it(`suppresses click and keyboard activation on a disabled nonbutton Toast.${part}`, async () => {
    const target = document.createElement('main');
    document.body.append(target);
    const app = mount(Fixture, {
      target,
      props: { nonButton: true, disabled: true },
    });
    mounted.push(app);
    flushSync();
    await tick();
    const host = app.snapshot()[part]!;
    expect(host.getAttribute('aria-disabled')).toBe('true');
    host.click();
    for (const key of ['Enter', ' '])
      for (const type of ['keydown', 'keyup'])
        host.dispatchEvent(
          new KeyboardEvent(type, { key, bubbles: true, cancelable: true }),
        );
    flushSync();
    expect(app.snapshot().calls).toEqual([]);
  });
}
