import type { Component } from 'svelte';
import TypesTable from '#lib/components/TypesTable.svelte';
import type { ReferencePart } from '../../../markdown/reference.ts';

/** What the `docs-types` Vite plugin passes each factory call in a page's `types.ts`. */
export type TypesPrecompute = { parts: ReferencePart[] };

const table =
	(part: ReferencePart, multiple: boolean): Component =>
	(internals, props) =>
		TypesTable(internals, { ...props, part, multiple });

function precomputed(url: string, precompute: TypesPrecompute | undefined) {
	if (!precompute) throw new Error(`${url} was not precomputed. The docs-types plugin fills it.`);
	return precompute.parts;
}

const shortName = (name: string) => name.split('.').pop()!;

/**
 * The reference table of one part, such as `Button`, as Base UI's `createTypes` returns it.
 * `_component` names the library export the plugin reads, which is not used at runtime.
 */
export function createTypes(
	url: string,
	_component: unknown,
	precompute?: TypesPrecompute
): Component {
	const [part] = precomputed(url, precompute);
	return table(part, false);
}

/**
 * The reference tables of several parts, keyed by part, such as `types.Root`, as Base UI's
 * `createMultipleTypes` returns them. Each table also shows its part's description.
 */
export function createMultipleTypes(
	url: string,
	_components: unknown,
	precompute?: TypesPrecompute
): { types: Record<string, Component> } {
	const parts = precomputed(url, precompute);
	return {
		types: Object.fromEntries(parts.map((part) => [shortName(part.name), table(part, true)]))
	};
}
