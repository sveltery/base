// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/components/FloatingTree.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// The FloatingNode component is not ported. useFloatingNodeId provides the parent id.

import { getContext, hasContext, setContext } from 'svelte';
import type { FloatingRootStore } from './FloatingRootStore.svelte.js';
import {
	createFloatingNodeId,
	FloatingTreeStore,
	type FloatingNodeRecord
} from './FloatingTreeStore.js';

const TREE = Symbol('floating-tree');
const NODE = Symbol('floating-node');

export function setFloatingTree() {
	if (hasContext(TREE)) return getContext<FloatingTreeStore>(TREE);
	const tree = new FloatingTreeStore();
	setContext(TREE, tree);
	return tree;
}

export function useFloatingTree() {
	if (!hasContext(TREE)) return null;
	return getContext<FloatingTreeStore>(TREE);
}

export function useFloatingParentNodeId(): string | null {
	if (!hasContext(NODE)) return null;
	return getContext<string>(NODE);
}

export function useFloatingNodeId(store: FloatingRootStore) {
	const tree = useFloatingTree();
	const parentId = useFloatingParentNodeId();
	const id = createFloatingNodeId();
	store.nodeId = id;
	if (!tree) return id;

	setContext(NODE, id);
	const node: FloatingNodeRecord = { id, parentId, context: store };
	$effect(() => {
		tree.addNode(node);
		return () => tree.removeNode(node);
	});
	return id;
}
