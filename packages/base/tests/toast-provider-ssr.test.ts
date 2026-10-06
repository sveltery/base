// Supplemental native SSR evidence; zero unchanged Original assertion credit.
import { expect, it, vi } from 'vitest';
import { render } from 'svelte/server';
import Fixture from './dom/ToastProviderFixture.svelte';
import { createToastManager } from '../src/lib/toast/createToastManager';
import type { ToastProviderContext } from '../src/lib/toast/context';

it('creates isolated Provider stores for SSR requests and never attaches a manager during rendering', () => {
  const manager = createToastManager();
  const subscribe = vi.spyOn(manager, ' subscribe');
  const contexts: ToastProviderContext[] = [];
  const first = render(Fixture, {
    props: {
      manager,
      capture: (context) => {
        contexts.push(context);
      },
    },
  });
  const second = render(Fixture, {
    props: {
      manager,
      capture: (context) => {
        contexts.push(context);
      },
    },
  });
  expect(first.body).toContain('data-testid="titles"');
  expect(second.body).toContain('data-testid="titles"');
  expect(contexts).toHaveLength(2);
  expect(contexts[0].store).not.toBe(contexts[1].store);
  expect(contexts[0].manager).not.toBe(contexts[1].manager);
  expect(subscribe).not.toHaveBeenCalled();
  manager.add({ id: 'unattached-channel', title: 'No SSR subscription', timeout: 0 });
  expect(contexts.map(({ manager: facade }) => facade.toasts)).toEqual([[], []]);
  contexts.forEach(({ store, manager: facade }, index) => {
    const snapshot = store.state;
    expect(facade.add({ id: 'after-render', title: 'Retained SSR facade', timeout: 0 })).toBe(
      'after-render',
    );
    expect(store.state).not.toBe(snapshot);
    expect(facade.toasts).toHaveLength(1);
    expect(facade.toasts[0]).toMatchObject({
      id: 'after-render',
      title: 'Retained SSR facade',
      updateKey: 0,
      transitionStatus: 'starting',
    });
    if (index === 0) expect(contexts[1].manager.toasts).toEqual([]);
  });
});
