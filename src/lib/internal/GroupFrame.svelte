<!--
	Shared host frame for a group root. Renders a `<div>`, or the `render` snippet.
	Derived from the host markup of Base UI v1.8.0 CheckboxGroup and RadioGroup
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts" generics="State extends object">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import type { RenderChildren } from './render-children.js';

	let {
		hostProps,
		state,
		render,
		children
	}: {
		hostProps: HTMLAttributes<HTMLDivElement> & Record<symbol, unknown>;
		state: State;
		render?: Snippet<
			[HTMLAttributes<HTMLDivElement> & Record<symbol, unknown>, State, children: RenderChildren]
		>;
		children?: Snippet;
	} = $props();
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
