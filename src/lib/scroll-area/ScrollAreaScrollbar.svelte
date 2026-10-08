<!--
	A vertical or horizontal scrollbar. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/scroll-area/scrollbar/ScrollAreaScrollbar.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
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
		render: render != null,
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
		<div {...part.hostProps} bind:this={part.element}>{@render children?.()}</div>
	{/if}
{/if}
