import { expect, it, vi } from 'vitest';
import { render } from 'svelte/server';
import Fixture from './dom/ToastProviderFixture.svelte';
import { createToastManager } from '../src/lib/toast/createToastManager';
import type { ToastProviderContext } from '../src/lib/toast/context';

it('creates isolated Provider stores for SSR requests and never attaches a manager during rendering', () => {
  const manager = createToastManager();
  const subscribe = vi.spyOn(manager, ' subscribe');
  const contexts: ToastProviderContext[] = [];
  const first = render(Fixture, { props: { manager, capture: (context) => { contexts.push(context); } } });
  const second = render(Fixture, { props: { manager, capture: (context) => { contexts.push(context); } } });
  expect(first.body).toContain('data-testid="titles"');
  expect(second.body).toContain('data-testid="titles"');
  expect(contexts).toHaveLength(2);
  expect(contexts[0].store).not.toBe(contexts[1].store);
  expect(contexts[0].manager).not.toBe(contexts[1].manager);
  expect(subscribe).not.toHaveBeenCalled();
  contexts.forEach(({ store, manager: facade }) => {
    const snapshot = store.state;
    facade.add({ id: 'after-render', title: 'Disposed SSR store', timeout: 0 });
    expect(store.state).toBe(snapshot);
    expect(facade.toasts).toEqual([]);
  });
});
