<script lang="ts" generics="State">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		elementProps,
		partState,
		render,
		children
	}: {
		elementProps: HTMLAttributes<HTMLDivElement> & Record<symbol, unknown>;
		partState: State;
		render?: Snippet<[props: HTMLAttributes<HTMLDivElement>, state: State, children: Snippet]>;
		children?: Snippet;
	} = $props();
</script>

{#snippet body()}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(elementProps, partState, body)}
{:else}
	<div {...elementProps}>{@render body()}</div>
{/if}
