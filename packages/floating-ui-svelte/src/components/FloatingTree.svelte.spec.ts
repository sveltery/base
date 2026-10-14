// Assertions follow Base UI v1.9.0 packages/react/src/menubar/Menubar.tsx, whose content registers
// a tree node with no floating context (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { FloatingTreeStore } from './FloatingTreeStore.js';
import TreeNodeHarness from './__tests__/TreeNodeHarness.svelte';

function shape(tree: FloatingTreeStore, rootId: string | undefined) {
	return tree.nodes.map((node) => ({
		id: node.id === rootId ? 'root' : 'other',
		parentId: node.parentId === rootId ? 'root' : node.parentId,
		hasContext: node.context != null
	}));
}

describe('useFloatingNodeId', () => {
	it('registers a node without a floating store and parents nested nodes to it', async () => {
		const { component, rerender } = render(TreeNodeHarness);

		expect(component.nodeId).toMatch(/^base-ui-floating-\d+$/);
		expect(shape(component.tree, component.nodeId)).toEqual([
			{ id: 'other', parentId: 'root', hasContext: true },
			{ id: 'root', parentId: null, hasContext: false }
		]);

		await rerender({ child: false });

		expect(shape(component.tree, component.nodeId)).toEqual([
			{ id: 'root', parentId: null, hasContext: false }
		]);
	});

	it('registers into an external tree', () => {
		const externalTree = new FloatingTreeStore();
		const { component, unmount } = render(TreeNodeHarness, { externalTree, child: false });

		expect(shape(externalTree, component.nodeId)).toEqual([
			{ id: 'root', parentId: null, hasContext: false }
		]);

		unmount();

		expect(externalTree.nodes).toEqual([]);
	});
});

describe('setFloatingTree', () => {
	it('starts a fresh tree instead of joining the enclosing one', () => {
		const { component } = render(TreeNodeHarness, { freshChild: true });
		flushSync();
		const inner = component.getInner()!;
		const names = new Map([
			[component.nodeId, 'outer'],
			[inner.nodeId, 'inner']
		]);
		const nodes = (tree: FloatingTreeStore) =>
			tree.nodes.map((node) => [names.get(node.id) ?? 'child', names.get(node.parentId ?? '')]);

		expect(inner.tree).not.toBe(component.tree);
		expect(nodes(component.tree)).toEqual([
			['child', 'outer'],
			['outer', undefined]
		]);
		// The nested root keeps the enclosing node as its parent, as upstream's node context does.
		expect(nodes(inner.tree)).toEqual([
			['child', 'inner'],
			['inner', 'outer']
		]);
	});
});
