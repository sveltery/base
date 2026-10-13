<!--
	The draggable thumb that indicates the current scroll position. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/scroll-area/thumb/ScrollAreaThumb.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergeCssStyle, toCssStyle } from '../internal/css-style.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useScrollAreaRootContext, useScrollAreaScrollbarContext } from './context.svelte.js';
	import { scrollAreaThumbHeight, scrollAreaThumbWidth } from './css-vars.js';
	import { chain } from '../internal/mergeProps.js';
	import type { ScrollAreaThumbProps } from './types.js';

	const attachmentKey = createAttachmentKey();

	let {
		style,
		onpointerdown,
		onpointermove,
		onpointerup,
		onpointercancel,
		render,
		children,
		...elementProps
	}: ScrollAreaThumbProps = $props();

	const model = useScrollAreaRootContext();
	const scrollbar = useScrollAreaScrollbarContext();
	const vertical = $derived(scrollbar.orientation === 'vertical');

	let el = $state<HTMLDivElement | null>(null);

	function remember(node: HTMLDivElement) {
		el = node;
		return () => {
			if (el === node) el = null;
		};
	}

	$effect(() => {
		const node = el;
		if (vertical) model.thumbYElement = node;
		else model.thumbXElement = node;
		return () => {
			if (vertical) {
				if (model.thumbYElement === node) model.thumbYElement = null;
			} else if (model.thumbXElement === node) model.thumbXElement = null;
		};
	});

	const partState = $derived({
		scrolling: vertical ? model.scrollingY : model.scrollingX,
		orientation: scrollbar.orientation
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...getStateAttributesProps(partState),
		...elementProps,
		style: mergeCssStyle(
			toCssStyle({
				visibility: model.hasMeasuredScrollbar ? undefined : 'hidden',
				...(vertical
					? { height: `var(${scrollAreaThumbHeight})` }
					: { width: `var(${scrollAreaThumbWidth})` })
			}),
			style
		),
		onpointerdown: chain((event) => model.pointerDown(event), onpointerdown),
		onpointermove: chain((event) => model.pointerMove(event), onpointermove),
		onpointerup: chain((event) => model.pointerUp(event), onpointerup),
		onpointercancel: chain((event) => model.pointerUp(event), onpointercancel),
		[attachmentKey]: remember
	});

	const thumbStyle = $derived(hostProps.style);

	$effect(() => {
		model.repaint(vertical ? model.thumbYElement : model.thumbXElement, thumbStyle);
	});
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
