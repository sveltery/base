<!--
	Host element for a part. Counterpart of upstream `useRenderElement`.
	`tag` selects the host and the attribute type. A `render` snippet replaces it.
-->
<script
	lang="ts"
	generics="Tag extends keyof SvelteHTMLElements, State, Props extends SvelteHTMLElements[Tag]"
>
	import type { Snippet } from 'svelte';
	import type { SvelteHTMLElements } from 'svelte/elements';
	import type { RenderChildren } from './render-children.js';

	let {
		tag,
		elementProps,
		partState,
		render,
		children
	}: {
		tag: Tag;
		elementProps: Props;
		partState: State;
		render?: Snippet<[props: Props, state: State, children: RenderChildren]>;
		children?: Snippet;
	} = $props();
</script>

{#if render}
	{@render render(elementProps, partState, children)}
{:else}
	<svelte:element this={tag} {...elementProps}>{@render children?.()}</svelte:element>
{/if}
