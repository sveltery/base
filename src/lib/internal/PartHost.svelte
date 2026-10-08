<!--
	Host element for a part. Counterpart of upstream `useRenderElement`.
	`tag` selects the host and the attribute type. A `render` snippet replaces it.
-->
<script lang="ts" generics="Tag extends keyof HTMLElementTagNameMap, State">
	import type { Snippet } from 'svelte';
	import type { SvelteHTMLElements } from 'svelte/elements';

	type HostProps = SvelteHTMLElements[Tag];

	let {
		tag,
		elementProps,
		partState,
		render,
		children
	}: {
		tag: Tag;
		elementProps: HostProps;
		partState: State;
		render?: Snippet<[props: HostProps, state: State, children: Snippet]>;
		children?: Snippet;
	} = $props();
</script>

{#snippet body()}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(elementProps, partState, body)}
{:else}
	<svelte:element this={tag} {...elementProps}>{@render body()}</svelte:element>
{/if}
