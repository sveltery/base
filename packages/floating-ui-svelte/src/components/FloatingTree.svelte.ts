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

export function useFloatingNodeId(store: FloatingRootStore) {
	const tree = useFloatingTree();
	const parentId = useFloatingParentNodeId();
	const id = createFloatingNodeId();
	store.nodeId = id;
	if (!tree) return id;

	setParentNodeId(id);
	const node: FloatingNodeRecord = { id, parentId, context: store };
	$effect(() => {
		tree.addNode(node);
		return () => tree.removeNode(node);
	});
	return id;
}
