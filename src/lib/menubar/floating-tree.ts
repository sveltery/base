// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/components/FloatingTree.tsx
// and the `MenubarContent` node of packages/react/src/menubar/Menubar.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { getAllContexts, setContext } from 'svelte';
import {
	FloatingRootStore,
	setFloatingTree,
	useFloatingNodeId,
	useFloatingTree
} from '@sveltery/floating-ui-svelte';

export type FloatingTreeStore = ReturnType<typeof setFloatingTree>;
type FloatingNodeRecord = FloatingTreeStore['nodes'][number];
type Listener = (data?: unknown) => void;

/** A local copy of the package's `FloatingTreeStore`, which it does not export. */
function createFloatingTree(): FloatingTreeStore {
	const nodes: FloatingNodeRecord[] = [];
	const listeners = new Map<string, Set<Listener>>();
	return {
		nodes,
		events: {
			emit(event, data) {
				listeners.get(event)?.forEach((listener) => listener(data));
			},
			on(event, listener) {
				const set = listeners.get(event) ?? new Set();
				set.add(listener);
				listeners.set(event, set);
				return () => set.delete(listener);
			},
			off(event, listener) {
				listeners.get(event)?.delete(listener);
			}
		},
		addNode(node) {
			nodes.push(node);
		},
		removeNode(node) {
			const index = nodes.indexOf(node);
			if (index !== -1) nodes.splice(index, 1);
		}
	};
}

/**
 * Upstream `<FloatingTree>` always starts a new tree, and the menubar registers its own node in
 * it. `setFloatingTree` reuses an enclosing tree, such as a Dialog's, and the package exports no
 * way to start another. So this replaces the enclosing tree under its own context key.
 */
export function setOwnFloatingTree(): { tree: FloatingTreeStore; nodeId: string } {
	const enclosing = useFloatingTree();
	let tree: FloatingTreeStore;
	if (enclosing) {
		tree = createFloatingTree();
		for (const [key, value] of getAllContexts()) {
			if (value === enclosing) setContext(key, tree);
		}
	} else {
		tree = setFloatingTree();
	}
	// The menubar node never opens, so tree queries skip it and look at its menus.
	const node = new FloatingRootStore({
		nested: false,
		floatingId: '',
		floatingElementKind: 'popup'
	});
	return { tree, nodeId: useFloatingNodeId(node) };
}
