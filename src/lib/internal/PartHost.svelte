<!--
	Host element for a part. Counterpart of upstream `useRenderElement`.
	`tag` is the host when `render` is omitted. Div parts can leave it off;
	other elements pass their tag as they adopt this host.
-->
<script lang="ts" generics="State, Element extends HTMLElement = HTMLDivElement">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		tag = 'div',
		elementProps,
		partState,
		render,
		children
	}: {
		tag?: keyof HTMLElementTagNameMap;
		elementProps: HTMLAttributes<Element> & Record<symbol, unknown>;
		partState: State;
		render?: Snippet<[props: HTMLAttributes<Element>, state: State, children: Snippet]>;
		children?: Snippet;
	} = $props();
</script>

{#snippet body()}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(elementProps, partState, body)}
{:else if tag === 'div'}
	<div {...elementProps as HTMLAttributes<HTMLDivElement>}>{@render body()}</div>
{:else}
	<!-- The tag union is too wide to spread onto `svelte:element` directly. -->
	<svelte:element this={tag as 'span'} {...elementProps as HTMLAttributes<HTMLSpanElement>}>
		{@render body()}
	</svelte:element>
{/if}
