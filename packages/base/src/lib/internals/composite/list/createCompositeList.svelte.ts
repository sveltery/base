// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md; parity/radio/source-correspondence.md.
import { onDestroy, untrack } from 'svelte';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import {
  setCompositeListContext,
  type CompositeListRegistration,
  type CompositeMetadata,
} from './CompositeListContext.js';
interface CompositeListItem {
  index: number;
  element: HTMLElement;
  registration: CompositeListRegistration;
}
interface Parameters {
  elementsRef: { current: Array<HTMLElement | null> };
  labelsRef?: { current: Array<string | null> };
  onMapChange?: (map: Map<Element, CompositeMetadata>) => void;
}
export function createCompositeList(getParameters: () => Parameters) {
  let mapTick = $state(0);
  const listeners = new SvelteSet<(map: Map<Element, CompositeMetadata>) => void>();
  const map = new SvelteMap<Element, CompositeListRegistration>();
  const nextIndexRef = { current: 0 };
  const isDirtyRef = { current: true };
  const itemsRef: { current: readonly CompositeListItem[] | null } = {
    current: null,
  };
  const mutationObserverRef: { current: MutationObserver | null } = {
    current: null,
  };
  const scheduleMapUpdate = () => {
    if (isDirtyRef.current) return;
    isDirtyRef.current = true;
    untrack(() => {
      mapTick += 1;
    });
  };
  const register = (node: Element, registration: CompositeListRegistration) => {
    map.set(node, registration);
    scheduleMapUpdate();
  };

  const unregister = (node: Element) => {
    map.delete(node);
    scheduleMapUpdate();
  };

  const syncRefs = (items: readonly CompositeListItem[]) => {
    const nextMap = new SvelteMap<Element, CompositeMetadata>();
    const { elementsRef, labelsRef } = getParameters();

    elementsRef.current.length = 0;
    if (labelsRef) {
      labelsRef.current.length = 0;
    }

    items.forEach((item) => {
      nextMap.set(item.element, {
        ...(item.registration.metadata ?? {}),
        index: item.index,
      });

      elementsRef.current[item.index] = item.element;

      if (labelsRef) {
        labelsRef.current[item.index] =
          item.registration.label !== undefined
            ? item.registration.label
            : (item.registration.textRef?.current?.textContent ?? item.element.textContent);
      }
    });

    nextIndexRef.current = elementsRef.current.length;

    return nextMap;
  };

  function observe(sortedNodes: HTMLElement[]) {
    mutationObserverRef.current?.disconnect();
    mutationObserverRef.current = null;

    // A single item can't reorder.
    if (typeof MutationObserver !== 'function' || sortedNodes.length < 2) {
      return;
    }

    const mutationObserver = new MutationObserver((entries) => {
      // Only verify the order after a move: a node that was removed and later
      // re-added within the same batch. Additions and removals alone can't
      // change the relative order of the remaining items, and items that mount
      // or unmount re-sort through `register`/`unregister`.
      if (!hasMovedNode(entries)) {
        return;
      }

      let previousConnectedNode: Element | null = null;

      // If any connected node now appears before the previous connected node,
      // wrappers/items moved and the index map needs to be rebuilt.
      for (const node of sortedNodes) {
        if (!node.isConnected) {
          continue;
        }

        if (previousConnectedNode && sortByDocumentPosition(previousConnectedNode, node) > 0) {
          mutationObserver.disconnect();
          scheduleMapUpdate();
          return;
        }

        previousConnectedNode = node;
      }
    });

    mutationObserverRef.current = mutationObserver;

    // A reorder that changes item indexes must invert at least one adjacent pair
    // from the previous sorted order. Observing each pair's common parent catches
    // both direct item moves and ancestor wrapper moves at the boundary.
    const roots = new SvelteSet<Element>();
    for (let i = 1; i < sortedNodes.length; i += 1) {
      const root = getCommonAncestor(sortedNodes[i - 1], sortedNodes[i]);
      if (root) {
        roots.add(root);
      }
    }

    roots.forEach((root) => mutationObserver.observe(root, { childList: true }));
  }

  const flush = () => {
    const [items, automaticNodes] = getCompositeListSnapshot(map);
    const nextMap = syncRefs(items);

    const previousItems = itemsRef.current;
    const changed =
      !previousItems ||
      previousItems.length !== items.length ||
      items.some((item, index) => {
        const previousItem = previousItems[index];
        return (
          item.index !== previousItem.index ||
          item.element !== previousItem.element ||
          item.registration.index !== previousItem.registration.index ||
          item.registration.metadata !== previousItem.registration.metadata
        );
      });

    observe(automaticNodes);
    itemsRef.current = items;
    isDirtyRef.current = false;

    if (!changed) {
      return;
    }

    listeners.forEach((listener) => listener(nextMap));
    getParameters().onMapChange?.(nextMap);
  };

  $effect(() => {
    void mapTick;
    untrack(() => {
      if (isDirtyRef.current) flush();
    });
  });
  onDestroy(() => {
    mutationObserverRef.current?.disconnect();
    getParameters().elementsRef.current = [];
    const labelsRef = getParameters().labelsRef;
    if (labelsRef) labelsRef.current = [];
  });
  const subscribeMapChange = (fn: (map: Map<Element, CompositeMetadata>) => void) => {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  };
  setCompositeListContext({
    register,
    unregister,
    subscribeMapChange,
    nextIndexRef,
  });
}
function getCompositeListSnapshot(map: Map<Element, CompositeListRegistration>) {
  const reservedIndices = new SvelteSet<number>();
  const items: CompositeListItem[] = [];
  const automaticItems: CompositeListItem[] = [];

  map.forEach((registration, node) => {
    if (!node.isConnected) {
      return;
    }

    const index = registration.index;
    const item = {
      index: index ?? -1,
      element: node as HTMLElement,
      registration,
    };

    if (index === null) {
      automaticItems.push(item);
    } else if (index >= 0) {
      reservedIndices.add(index);
      items.push(item);
    }
  });

  let nextAutomaticIndex = 0;
  automaticItems.sort((a, b) => sortByDocumentPosition(a.element, b.element));

  automaticItems.forEach((item) => {
    while (reservedIndices.has(nextAutomaticIndex)) {
      nextAutomaticIndex += 1;
    }

    item.index = nextAutomaticIndex;
    items.push(item);
    nextAutomaticIndex += 1;
  });

  if (reservedIndices.size > 0) {
    items.sort((a, b) => a.index - b.index);
  }

  return [items, automaticItems.map((item) => item.element)] as const;
}

function getCommonAncestor(firstNode: Element, lastNode: Element) {
  let ancestor = firstNode.parentElement;

  // The `parentElement` walk cannot cross shadow boundaries, so the native
  // `contains` is sufficient here.
  while (ancestor && !ancestor.contains(lastNode)) {
    ancestor = ancestor.parentElement;
  }

  return ancestor;
}

function hasMovedNode(entries: MutationRecord[]) {
  for (const entry of entries) {
    for (let i = 0; i < entry.removedNodes.length; i += 1) {
      if (entry.removedNodes[i].isConnected) {
        return true;
      }
    }
  }

  return false;
}

function sortByDocumentPosition(a: Element, b: Element) {
  // `DOCUMENT_POSITION_CONTAINED_BY` is always reported alongside `FOLLOWING`, and `CONTAINS`
  // alongside `PRECEDING`, so testing `FOLLOWING` alone orders siblings and nested items alike.
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}
