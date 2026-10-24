// Derived from cmdk v1.1.1 cmdk/src/index.tsx (commit dd2250ed608443e8f32bafc5fa2d1d07a3746aa3).
// MIT, see THIRD_PARTY_NOTICES.md.

import { untrack, type Snippet } from 'svelte';
import { defineContext } from '../internal/context.js';
import type { GroupModel } from './item-state.svelte.js';
import type { CommandModel } from './root-state.svelte.js';

export const ANCHOR_PREFIX = 'cmdk-part:';

export interface Part {
	readonly anchor: string;
	readonly sequence: number;
	readonly kind: 'item' | 'group' | 'other';
	readonly view: Snippet;
}

export class Container {
	readonly root: CommandModel;
	readonly group: GroupModel | undefined;
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- filled while components initialize; `#version` is the reactive signal
	readonly #parts = new Set<Part>();
	#version = $state(0);

	constructor(root: CommandModel, group?: GroupModel) {
		this.root = root;
		this.group = group;
	}

	has(part: Part): boolean {
		return this.#parts.has(part);
	}

	register(part: Part): () => void {
		this.#parts.add(part);
		return () => {
			this.#parts.delete(part);
			this.touch();
		};
	}

	touch(): void {
		untrack(() => (this.#version += 1));
	}

	parts = $derived.by(() => {
		void this.#version;
		return this.root.arrange(this, [...this.#parts]);
	});
}

const [, setContainer, findContainer] = defineContext<Container | undefined>(
	'Sveltery Base: CommandListContext is missing. Command parts must be placed within <Command.List>.'
);
export { setContainer };

export function usePart(
	root: CommandModel,
	part: Part,
	register?: () => () => void
): Container | undefined {
	const container = findContainer();
	const unregister = [register?.(), container?.register(part)];
	$effect.pre(() => {
		root.relayout();
		container?.touch();
		return () => unregister.forEach((release) => release?.());
	});
	return container;
}
