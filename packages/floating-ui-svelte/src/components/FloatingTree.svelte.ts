// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/components/FloatingTree.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The FloatingNode component is not ported. useFloatingNodeId provides the parent id.

import { createContext } from 'svelte';
import type { FloatingRootStore } from './FloatingRootStore.svelte.js';
import {
	createFloatingNodeId,
	FloatingTreeStore,
	type FloatingNodeRecord
} from './FloatingTreeStore.js';

const [getTree, setTree, hasTree] = createContext<FloatingTreeStore>();
const [getParentNodeId, setParentNodeId, hasParentNodeId] = createContext<string>();

export function setFloatingTree() {
	return hasTree() ? getTree() : setTree(new FloatingTreeStore());
}

export function useFloatingTree() {
	return hasTree() ? getTree() : null;
}

export function useFloatingParentNodeId(): string | null {
	return hasParentNodeId() ? getParentNodeId() : null;
}

/**
 * Registers a node into the tree and publishes its id as the parent of nested nodes.
 * Without a `store`, the node has no floating context, as upstream's MenubarContent node.
 */
export function useFloatingNodeId(store?: FloatingRootStore, externalTree?: FloatingTreeStore) {
	const tree = externalTree ?? useFloatingTree();
	const parentId = useFloatingParentNodeId();
	const id = createFloatingNodeId();
	if (store) store.nodeId = id;
	if (!tree) return id;

	setParentNodeId(id);
	const node: FloatingNodeRecord = store ? { id, parentId, context: store } : { id, parentId };
	$effect(() => {
		tree.addNode(node);
		return () => tree.removeNode(node);
	});
	return id;
}
