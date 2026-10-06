// Real native component/store/emitter supplement; zero unchanged Original assertion credit.
import { afterEach, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import { FloatingTreeStore } from '../../src/lib/floating-ui/components/FloatingTreeStore.js';
import { MenuStore } from '../../src/lib/menu/store/MenuStore.svelte.js';
import type { MenuRoot } from '../../src/lib/menu/types.js';
import { REASONS } from '../../src/lib/internals/reasons.js';
import Fixture from './MenuTreeSubscriptionLifetimeFixture.svelte';

type OpenRequest = { open: boolean; eventDetails: MenuRoot.ChangeEventDetails };
const cleanups: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
  document.body.replaceChildren();
});

async function setup() {
  const target = document.createElement('div');
  document.body.append(target);
  const first = new FloatingTreeStore();
  const second = new FloatingTreeStore();
  const component = mount(Fixture, { target, props: { first, second } });
  let stopped = false;
  const stop = async () => {
    if (!stopped) {
      stopped = true;
      await unmount(component);
    }
  };
  cleanups.push(stop);
  await tick();
  component.activateFirst();
  await tick();
  const store = component.store();
  expect(store).toBeInstanceOf(MenuStore);
  expect(store.select('floatingTreeRoot')).toBe(first);
  expect(store.select('floatingParentNodeId')).toBe('first-parent-node');
  const positioner = document.querySelector('[data-testid="tree-positioner"]');
  const popup = document.querySelector('[data-testid="tree-popup"]');
  expect(positioner).not.toBeNull();
  expect(popup?.getAttribute('role')).toBe('menu');
  component.activateSecond();
  await tick();
  expect(component.store()).toBe(store);
  expect(store.select('floatingTreeRoot')).toBe(second);
  expect(store.select('floatingParentNodeId')).toBe('second-parent-node');
  expect(store.select('activeTriggerElement')).toBe(document.getElementById('second-tree-trigger'));
  expect(document.querySelector('[data-testid="tree-positioner"]')).toBe(positioner);
  expect(document.querySelector('[data-testid="tree-popup"]')).toBe(popup);
  const requests: OpenRequest[] = [];
  const observeRequest = (request: OpenRequest) => requests.push(request);
  const rootEvents = store.state.floatingRootContext.context.events;
  rootEvents.on('setOpen', observeRequest);
  cleanups.push(() => rootEvents.off('setOpen', observeRequest));
  const otherItem = target.querySelector<HTMLElement>('[data-testid="other-menu-item"]')!;
  return { component, store, first, second, requests, otherItem, stop, popup, positioner };
}

it('moves the installed menu-open listener while retaining its live node and hover business', async () => {
  const { store, first, second, requests } = await setup();
  store.set('hoverEnabled', true);
  const childOpened = {
    open: true,
    nodeId: 'opened-child',
    parentNodeId: store.select('floatingNodeId'),
    reason: REASONS.triggerPress,
  };
  first.events.emit('menuopenchange', childOpened);
  expect(store.select('hoverEnabled')).toBe(true);
  expect(requests).toEqual([]);
  second.events.emit('menuopenchange', childOpened);
  expect(store.select('hoverEnabled')).toBe(false);
  expect(requests).toEqual([]);
  await tick();
});

for (const kind of ['sibling-open', 'parent-close', 'item-hover', 'popup-close'] as const) {
  it(`isolates the real ${kind} callback to the newly installed tree`, async () => {
    const { store, first, second, requests, otherItem } = await setup();
    const domEvent = new MouseEvent('mouseup');
    const emit = (tree: FloatingTreeStore) => {
      if (kind === 'sibling-open') {
        tree.events.emit('menuopenchange', {
          open: true,
          nodeId: 'another-sibling',
          parentNodeId: store.select('floatingParentNodeId'),
          reason: REASONS.triggerPress,
        });
      } else if (kind === 'parent-close') {
        tree.events.emit('menuopenchange', {
          open: false,
          nodeId: store.select('floatingParentNodeId'),
          parentNodeId: null,
          reason: REASONS.escapeKey,
        });
      } else if (kind === 'item-hover') {
        tree.events.emit('itemhover', {
          nodeId: store.select('floatingParentNodeId'),
          target: otherItem,
        });
      } else {
        tree.events.emit('close', { domEvent, reason: REASONS.cancelOpen });
      }
    };
    emit(first);
    expect(requests).toEqual([]);
    emit(second);
    expect(requests).toHaveLength(1);
    expect(requests[0].open).toBe(false);
    expect(requests[0].eventDetails.reason).toBe(
      kind === 'parent-close'
        ? REASONS.escapeKey
        : kind === 'popup-close'
          ? REASONS.cancelOpen
          : REASONS.siblingOpen,
    );
    expect(requests[0].eventDetails.isCanceled).toBe(true);
    if (kind === 'popup-close') expect(requests[0].eventDetails.event).toBe(domEvent);
    expect(store.select('open')).toBe(true);
    await tick();
  });
}

it('retains parent-node and current-trigger guards on the current tree', async () => {
  const { store, second, requests } = await setup();
  second.events.emit('menuopenchange', {
    open: false,
    nodeId: 'unrelated-parent',
    parentNodeId: null,
    reason: REASONS.escapeKey,
  });
  second.events.emit('itemhover', {
    nodeId: store.select('floatingParentNodeId'),
    target: store.select('activeTriggerElement'),
  });
  expect(requests).toEqual([]);
  expect(store.select('open')).toBe(true);
  await tick();
});

for (const teardown of ['whole-component', 'same-turn-tree-change-and-owner-removal'] as const) {
  it(`removes both tree subscriptions after ${teardown}`, async () => {
    const { component, store, first, second, requests, otherItem, stop } = await setup();
    // The observer belongs to this test and stays on the real root emitter after owner teardown.
    if (teardown === 'whole-component') await stop();
    else {
      component.replaceTreeAndHideOwners();
      await tick();
    }
    requests.length = 0;
    store.set('hoverEnabled', true);
    for (const tree of [first, second]) {
      tree.events.emit('menuopenchange', {
        open: true,
        nodeId: 'opened-child',
        parentNodeId: store.select('floatingNodeId'),
        reason: REASONS.triggerPress,
      });
      tree.events.emit('menuopenchange', {
        open: false,
        nodeId: store.select('floatingParentNodeId'),
        parentNodeId: null,
        reason: REASONS.escapeKey,
      });
      tree.events.emit('itemhover', {
        nodeId: store.select('floatingParentNodeId'),
        target: otherItem,
      });
      tree.events.emit('close', {
        domEvent: new MouseEvent('mouseup'),
        reason: REASONS.cancelOpen,
      });
    }
    expect(requests).toEqual([]);
    expect(store.select('hoverEnabled')).toBe(true);
    expect(document.querySelector('[data-testid="tree-positioner"]')).toBeNull();
    expect(document.querySelector('[data-testid="tree-popup"]')).toBeNull();
    await tick();
  });
}
