// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/components/FloatingTree.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The FloatingNode component is provideFloatingNodeId. useFloatingNodeId registers and provides.

import { createContext } from 'svelte';
import type { FloatingRootStore } from './FloatingRootStore.svelte.js';
import {
	createFloatingNodeId,
	FloatingTreeStore,
	type FloatingNodeRecord
} from './FloatingTreeStore.js';

const [getTree, setTree, hasTree] = createContext<FloatingTreeStore>();
const [getParentNodeId, setParentNodeId, hasParentNodeId] = createContext<string | null>();

/**
 * Joins the enclosing tree, or provides a new one when there is none.
 * `fresh` always provides a new tree, as upstream `<FloatingTree>` does.
 */
export function setFloatingTree(options: { fresh?: boolean } = {}) {
	if (!options.fresh && hasTree()) return getTree();
	return setTree(new FloatingTreeStore());
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
	const id = registerFloatingNode(store, tree);
	if (tree) provideFloatingNodeId(id);
	return id;
}

/**
 * Registers a node without publishing it, as upstream `useFloatingNodeId`. `readParentId` reads a
 * parent forwarded from elsewhere; without it, the node's parent is the enclosing node. A `tree`
 * getter moves the node when the tree it reads changes, as upstream's `externalTree`.
 */
export function registerFloatingNode(
	store?: FloatingRootStore,
	tree: FloatingTreeStore | null | (() => FloatingTreeStore | null) = useFloatingTree(),
	readParentId?: () => string | null
) {
	const contextParentId = useFloatingParentNodeId();
	const parentId = readParentId ?? (() => contextParentId);
	const id = createFloatingNodeId();
	if (store) store.nodeId = id;
	const node: FloatingNodeRecord = {
		id,
		get parentId() {
			return parentId();
		},
		context: store
	};
	const readTree = typeof tree === 'function' ? tree : () => tree;
	$effect(() => {
		const current = readTree();
		current?.addNode(node);
		return () => current?.removeNode(node);
	});
	return id;
}

/** Publishes a node as the parent of nested nodes, as upstream `<FloatingNode id>`. */
export function provideFloatingNodeId(id: string | null) {
	setParentNodeId(id);
}
