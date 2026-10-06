// Base UI v1.8.0 FloatingTree node/context lifetime using native Svelte context.
// MIT: THIRD_PARTY_NOTICES.md; pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
import { getContext, setContext } from 'svelte';

import { FloatingTreeStore } from './FloatingTreeStore.js';
import type { FloatingNodeType } from '../types.js';
const NODE = Symbol('FloatingNode');
const TREE = Symbol('FloatingTree');
export function useFloatingParentNodeId(): string | null {
  return getContext<FloatingNodeType | undefined>(NODE)?.id || null;
}
export function useFloatingTree(externalTree?: FloatingTreeStore) {
  return externalTree ?? getContext<FloatingTreeStore | undefined>(TREE) ?? null;
}
export function provideFloatingTree(externalTree?: FloatingTreeStore) {
  const tree = externalTree ?? new FloatingTreeStore();
  setContext(TREE, tree);
  return tree;
}
export function useFloatingNodeId(id: string | undefined, externalTree?: FloatingTreeStore) {
  const tree = useFloatingTree(externalTree);
  const parentId = useFloatingParentNodeId();
  const node: FloatingNodeType = { id, parentId };
  $effect(() => {
    if (!id) return;
    tree?.addNode(node);
    return () => {
      tree?.removeNode(node);
    };
  });
  return id;
}

/** Native provider boundary for the original separate FloatingNode component. */
export function provideFloatingNode(getId: () => string | undefined) {
  const parentId = useFloatingParentNodeId();
  setContext<FloatingNodeType>(NODE, {
    get id() {
      return getId();
    },
    parentId,
  });
}
