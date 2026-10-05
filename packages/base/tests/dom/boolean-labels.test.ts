// Actual immutable Base UI1.8 / React+DOM19.2.8 and native Svelte label witnesses.
// Supplemental framework checks; zero ordinary assertion credit. MIT.
import { afterEach, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import NativeFixture from '../../../../apps/fixtures/src/lib/BooleanLabelFixture.svelte';
import {
  mountBooleanLabelReference,
  type BooleanLabelState,
} from '../../../../apps/fixtures/src/lib/boolean-label-reference.js';

const cleanups: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

const initial: BooleanLabelState = {
  present: false,
  id: 'native-label-a',
  htmlFor: 'label-control',
};
const phases: BooleanLabelState[] = [
  { ...initial, present: true },
  { ...initial, present: true, id: 'native-label-b' },
  { ...initial, present: true, id: 'native-label-b', htmlFor: 'other-control' },
  { ...initial, present: true, id: 'native-label-b' },
  { ...initial, present: true, id: '' },
  { ...initial, present: false },
];
const expected = [
  'native-label-a',
  'native-label-b',
  null,
  'native-label-b',
  'label-control-label',
  null,
];

function hostInShadow() {
  const host = document.createElement('div');
  document.body.append(host);
  return host.attachShadow({ mode: 'open' });
}

for (const family of ['checkbox', 'switch'] as const) {
  it(`${family} actual source refreshes a shadow native label after each React commit`, async () => {
    const shadow = hostInShadow();
    const view = mountBooleanLabelReference(shadow, family, initial);
    cleanups.push(view.dispose);
    await vi.waitFor(() => expect(shadow.querySelector('[data-control]')).not.toBeNull());
    const main = shadow.querySelector('main')!;
    expect(main.getAttribute('data-reference-react')).toBe('19.2.8');
    expect(main.getAttribute('data-reference-react-dom')).toBe('19.2.8');
    const control = shadow.querySelector('[data-control]')!;
    expect(control.getAttribute('aria-labelledby')).toBeNull();
    for (let index = 0; index < phases.length; index++) {
      view.setLabel(phases[index]);
      await vi.waitFor(() => {
        expect(shadow.querySelector('label') !== null).toBe(phases[index].present);
        expect(control.getAttribute('aria-labelledby')).toBe(expected[index]);
      });
    }
  });

  it.each([false, true])(
    `${family} native observer refreshes a shadow label and releases its actual root observation (initial label: %s)`,
    async (present) => {
      const observe = vi.spyOn(MutationObserver.prototype, 'observe');
      const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
      const shadow = hostInShadow();
      const component = mount(NativeFixture, {
        target: shadow,
        props: { family, initial: { ...initial, present } },
      });
      let disposed = false;
      cleanups.push(async () => {
        if (!disposed) await unmount(component);
      });
      flushSync();
      const control = shadow.querySelector('[data-control]')!;
      expect(control.getAttribute('aria-labelledby')).toBe(present ? initial.id : null);
      for (let index = 0; index < phases.length; index++) {
        component.setLabel(phases[index]);
        flushSync();
        await tick();
        await vi.waitFor(() =>
          expect(control.getAttribute('aria-labelledby')).toBe(expected[index]),
        );
      }
      const ownedObservers = observe.mock.calls.flatMap(([target], index) =>
        target === shadow ? [observe.mock.instances[index]] : [],
      );
      expect(ownedObservers.length).toBeGreaterThan(0);
      await unmount(component);
      disposed = true;
      for (const observer of ownedObservers) expect(disconnect.mock.instances).toContain(observer);
    },
  );
}
