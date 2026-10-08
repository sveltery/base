// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/components/FloatingTreeStore.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Nodes are a plain array. There is no nodesRef bag.

import { createEventEmitter, type FloatingEvents } from '../utils/createEventEmitter.js';
import type { FloatingRootStore } from './FloatingRootStore.svelte.js';

export interface FloatingNodeRecord {
	id: string;
	parentId: string | null;
	context?: FloatingRootStore;
}

let nextNodeId = 0;

export function createFloatingNodeId() {
	nextNodeId += 1;
	return `base-ui-floating-${nextNodeId}`;
}

export class FloatingTreeStore {
	readonly nodes: FloatingNodeRecord[] = [];
	readonly events: FloatingEvents = createEventEmitter();

	addNode(node: FloatingNodeRecord) {
		this.nodes.push(node);
		this.events.emit('add', node);
	}

	removeNode(node: FloatingNodeRecord) {
		const index = this.nodes.indexOf(node);
		if (index !== -1) this.nodes.splice(index, 1);
	}
}

export function getNodeChildren(
	nodes: readonly FloatingNodeRecord[],
	id: string | null | undefined,
	onlyOpenChildren = true
): FloatingNodeRecord[] {
	const directChildren = nodes.filter((node) => node.parentId === id);
	return directChildren.flatMap((child) => [
		...(!onlyOpenChildren || child.context?.isOpen() ? [child] : []),
		...getNodeChildren(nodes, child.id, onlyOpenChildren)
	]);
}

/** Ancestors from parent toward the root. Matches upstream `getNodeAncestors`. */
export function getNodeAncestors(
	nodes: readonly FloatingNodeRecord[],
	id: string | null | undefined
): FloatingNodeRecord[] {
	const allAncestors: FloatingNodeRecord[] = [];
	let currentParentId = nodes.find((node) => node.id === id)?.parentId;

	while (currentParentId) {
		const currentNode = nodes.find((node) => node.id === currentParentId);
		currentParentId = currentNode?.parentId;
		if (currentNode) allAncestors.push(currentNode);
	}

	return allAncestors;
}
