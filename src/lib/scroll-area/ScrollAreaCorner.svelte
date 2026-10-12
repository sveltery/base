<!--
	The rectangle where the horizontal and vertical scrollbars meet. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/scroll-area/corner/ScrollAreaCorner.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergeCssStyle, toCssStyle } from '../internal/css-style.js';
	import { useScrollAreaRootContext } from './context.svelte.js';
	import type { ScrollAreaCornerProps, ScrollAreaCornerState } from './types.js';

	const attachmentKey = createAttachmentKey();

	let { style, render, children, ...elementProps }: ScrollAreaCornerProps = $props();

	const model = useScrollAreaRootContext();

	let el = $state<HTMLDivElement | null>(null);

	function remember(node: HTMLDivElement) {
		el = node;
		return () => {
			if (el === node) el = null;
		};
	}

	$effect(() => {
		if (model.hiddenState.corner) return;
		const node = el;
		model.cornerElement = node;
		return () => {
			if (model.cornerElement === node) model.cornerElement = null;
		};
	});

	const partState: ScrollAreaCornerState = {};

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		'aria-hidden': true,
		...elementProps,
		style: mergeCssStyle(
			toCssStyle({
				position: 'absolute',
				bottom: '0',
				insetInlineEnd: '0',
				width: `${model.cornerSize.width}px`,
				height: `${model.cornerSize.height}px`
			}),
			style
		),
		[attachmentKey]: remember
	});
</script>

{#if !model.hiddenState.corner}
	{#if render}
		{@render render(hostProps, partState, children)}
	{:else}
		<div {...hostProps}>{@render children?.()}</div>
	{/if}
{/if}
