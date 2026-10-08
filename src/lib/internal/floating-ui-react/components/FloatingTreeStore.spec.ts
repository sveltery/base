// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/utils/nodes.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import { describe, expect, it } from 'vitest';
import { getNodeAncestors, getNodeChildren, type FloatingNodeRecord } from './FloatingTreeStore.js';

const nodes: FloatingNodeRecord[] = [
	{ id: 'root', parentId: null },
	{ id: 'child', parentId: 'root' },
	{ id: 'grand', parentId: 'child' }
];

describe('floating tree nodes', () => {
	it('lists ancestors from the parent toward the root', () => {
		expect(getNodeAncestors(nodes, 'grand').map((node) => node.id)).toEqual(['child', 'root']);
		expect(getNodeAncestors(nodes, 'root')).toEqual([]);
		expect(getNodeAncestors(nodes, 'missing')).toEqual([]);
	});

	it('lists open descendants when no context marks them closed', () => {
		expect(getNodeChildren(nodes, 'root', false).map((node) => node.id)).toEqual([
			'child',
			'grand'
		]);
	});
});
