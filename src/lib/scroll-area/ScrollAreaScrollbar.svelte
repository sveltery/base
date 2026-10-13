<!--
	A vertical or horizontal scrollbar. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/scroll-area/scrollbar/ScrollAreaScrollbar.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { setScrollAreaScrollbarContext, useScrollAreaRootContext } from './context.svelte.js';
	import { ScrollbarPart } from './scrollbar-part.svelte.js';
	import type { ScrollAreaScrollbarProps } from './types.js';

	let {
		orientation = 'vertical',
		keepMounted = false,
		style,
		onpointerdown,
		onmousedown,
		onpointerup,
		onpointercancel,
		render,
		children,
		...elementProps
	}: ScrollAreaScrollbarProps = $props();

	const model = useScrollAreaRootContext();
	setScrollAreaScrollbarContext({
		get orientation() {
			return orientation;
		}
	});
	const part = new ScrollbarPart(model, () => ({
		orientation,
		keepMounted,
		style,
		elementProps,
		onpointerdown,
		onmousedown,
		onpointerup,
		onpointercancel
	}));
</script>

{#if part.shouldRender}
	{#if render}
		{@render render(part.hostProps, part.partState, children)}
	{:else}
		<div {...part.hostProps}>{@render children?.()}</div>
	{/if}
{/if}
