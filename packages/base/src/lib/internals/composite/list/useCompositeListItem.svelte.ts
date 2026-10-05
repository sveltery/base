// Ported from Base UI v1.8.0 useCompositeListItem; MIT: THIRD_PARTY_NOTICES.md.
import { untrack } from 'svelte';
import { useIsoLayoutEffect } from '../../../utils/useIsoLayoutEffect.svelte.js';
import { useCompositeListContext } from './CompositeListContext.js';
export interface UseCompositeListItemParameters {
  guess?: boolean;
  index?: number;
  label?: string | null;
  metadata?: Record<string, unknown>;
  textRef?: { current: HTMLElement | null };
}
export function useCompositeListItem(
  getParameters: () => UseCompositeListItemParameters = () => ({}),
) {
  const { register, unregister, subscribeMapChange, nextIndexRef } = useCompositeListContext();
  const initial = untrack(getParameters);
  let internalIndex = $state(initial.index == null && initial.guess ? nextIndexRef.current++ : -1);
  let component: HTMLElement | null = null;
  const index = () => getParameters().index ?? internalIndex;
  const registration = $derived.by(() => {
    const { metadata, index, label, textRef } = getParameters();
    return { metadata: metadata ?? null, index: index ?? null, label, textRef };
  });
  const ref = $derived.by(() => {
    const currentRegistration = registration;
    return (node: HTMLElement | null) => {
      if (component) unregister(component);
      component = node;
      if (node) register(node, currentRegistration);
    };
  });
  useIsoLayoutEffect(
    () => {
      if (getParameters().index != null) return;
      return subscribeMapChange((map) => {
        const next = component ? map.get(component)?.index : null;
        if (next != null) internalIndex = next;
      });
    },
    () => [getParameters().index, subscribeMapChange],
  );
  return {
    get ref() {
      return ref;
    },
    index,
  };
}
