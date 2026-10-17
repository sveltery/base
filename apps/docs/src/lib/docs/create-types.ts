import type { Component } from 'svelte';
import AdditionalTypesTable from '#lib/components/AdditionalTypes.svelte';
import TypesTable from '#lib/components/TypesTable.svelte';
import type { ReferencePart, ReferenceType } from '../../../markdown/reference.ts';

/** What the `docs-types` Vite plugin passes each factory call in a page's `types.ts`. */
export type TypesPrecompute = { parts: ReferencePart[]; additionalTypes: ReferenceType[] };

const table =
	(part: ReferencePart, multiple: boolean): Component =>
	(internals, props) =>
		TypesTable(internals, { ...props, part, multiple });

function precomputed(url: string, precompute: TypesPrecompute | undefined) {
	if (!precompute) throw new Error(`${url} was not precomputed. The docs-types plugin fills it.`);
	return precompute;
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
	const [part] = precomputed(url, precompute).parts;
	return table(part, false);
}

/**
 * The reference tables of several parts, keyed by part, such as `types.Root`, as Base UI's
 * `createMultipleTypes` returns them. Each table also shows its part's description.
 * `AdditionalTypes` renders the exported types no part documents.
 */
export function createMultipleTypes(
	url: string,
	_components: unknown,
	precompute?: TypesPrecompute
): {
	types: Record<string, Component>;
	AdditionalTypes: Component<{ showAdditionalTypes?: string[] }>;
} {
	const { parts, additionalTypes } = precomputed(url, precompute);
	return {
		types: Object.fromEntries(parts.map((part) => [shortName(part.name), table(part, true)])),
		AdditionalTypes: (internals, props) =>
			AdditionalTypesTable(internals, { ...props, types: additionalTypes })
	};
}
