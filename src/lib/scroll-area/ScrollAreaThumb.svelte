<!--
	The draggable thumb that indicates the current scroll position. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/scroll-area/thumb/ScrollAreaThumb.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergeCssStyle, toCssStyle } from '../internal/css-style.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useScrollAreaRootContext, useScrollAreaScrollbarContext } from './context.svelte.js';
	import { scrollAreaThumbHeight, scrollAreaThumbWidth } from './css-vars.js';
	import { chain } from './style.js';
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
	let rendered = $state<HTMLDivElement | null>(null);

	function remember(node: HTMLDivElement) {
		rendered = node;
		return () => {
			if (rendered === node) rendered = null;
		};
	}

	$effect(() => {
		const node = render ? rendered : el;
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
			mergeCssStyle(
				toCssStyle({
					visibility: model.hasMeasuredScrollbar ? undefined : 'hidden',
					...(vertical
						? { height: `var(${scrollAreaThumbHeight})` }
						: { width: `var(${scrollAreaThumbWidth})` })
				}),
				style
			),
			toCssStyle({
				transform: vertical
					? `translate3d(0,${model.thumbYOffset}px,0)`
					: `translate3d(${model.thumbXOffset}px,0,0)`,
				[scrollAreaThumbHeight]: vertical ? model.thumbYSizeOverride : undefined,
				[scrollAreaThumbWidth]: vertical ? undefined : model.thumbXSizeOverride
			})
		),
		onpointerdown: chain((event) => model.pointerDown(event), onpointerdown),
		onpointermove: chain((event) => model.pointerMove(event), onpointermove),
		onpointerup: chain((event) => model.pointerUp(event), onpointerup),
		onpointercancel: chain((event) => model.pointerUp(event), onpointercancel),
		...(render ? { [attachmentKey]: remember } : {})
	});
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps} bind:this={el}>{@render children?.()}</div>
{/if}
