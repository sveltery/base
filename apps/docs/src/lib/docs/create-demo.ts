import type { Component } from 'svelte';
import Demo from '#lib/components/Demo.svelte';
import type { DemoPrecompute, DemoVariant } from '../../../markdown/demos.ts';

/** A variant as `Demo` renders it: its component, and the files the `docs-demos` plugin read. */
export type DemoVariantData = DemoVariant & { name: string; component: Component };

/**
 * A demo with one component per styling variant, such as `{ CssModules, Tailwind }`, as Base UI's
 * `createDemoWithVariants` returns it. The `docs-demos` plugin passes `precompute`.
 */
export function createDemoWithVariants(
	url: string,
	variants: Record<string, Component>,
	precompute?: DemoPrecompute
): Component {
	if (!precompute) throw new Error(`${url} was not precomputed. The docs-demos plugin fills it.`);
	const data = Object.entries(variants).map(([name, component]) => ({
		...precompute.variants[name],
		name,
		component
	}));
	return (internals, props) => Demo(internals, { ...props, slug: precompute.slug, variants: data });
}
