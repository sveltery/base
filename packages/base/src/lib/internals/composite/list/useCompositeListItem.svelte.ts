// Ported from Base UI v1.8.0 useCompositeListItem; MIT: THIRD_PARTY_NOTICES.md.
import { untrack } from 'svelte';

import { useCompositeListContext } from './CompositeListContext.js';
export interface UseCompositeListItemParameters {
  guess?: boolean;
  index?: number;
  label?: string | null;
  metadata?: Record<string, unknown>;
  textRef?: { current: HTMLElement | null };
}
export class useCompositeListItem {
  private getParameters: () => UseCompositeListItemParameters;
  private context = useCompositeListContext();
  private internalIndex: number;
  private component: HTMLElement | null = null;
  private registration = $derived.by(() => {
    const { metadata, index, label, textRef } = this.getParameters();
    return { metadata: metadata ?? null, index: index ?? null, label, textRef };
  });

  constructor(getParameters: () => UseCompositeListItemParameters = () => ({})) {
    this.getParameters = getParameters;
    const { subscribeMapChange, nextIndexRef } = this.context;
    const initial = untrack(getParameters);
    this.internalIndex = $state(
      initial.index == null && initial.guess ? nextIndexRef.current++ : -1,
    );
    $effect(() => {
      if (this.getParameters().index != null) return;
      return subscribeMapChange((map) => {
        const next = this.component ? map.get(this.component)?.index : null;
        if (next != null) this.internalIndex = next;
      });
    });
  }

  index = () => this.getParameters().index ?? this.internalIndex;

  attach = (node: HTMLElement) => {
    const currentRegistration = this.registration;
    const { register, unregister } = this.context;
    return untrack(() => {
      this.component = node;
      register(node, currentRegistration);
      return () =>
        untrack(() => {
          unregister(node);
          if (this.component === node) this.component = null;
        });
    });
  };
}
