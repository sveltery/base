<!--
	A vertical or horizontal scrollbar. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/scroll-area/scrollbar/ScrollAreaScrollbar.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergeCssStyle, toCssStyle } from '../internal/css-style.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { scrollAreaStateAttributesMapping } from './attributes.js';
	import { setScrollAreaScrollbarContext, useScrollAreaRootContext } from './context.svelte.js';
	import {
		scrollAreaCornerHeight,
		scrollAreaCornerWidth,
		scrollAreaThumbHeight,
		scrollAreaThumbWidth
	} from './css-vars.js';
	import { chain } from './style.js';
	import type { ScrollAreaScrollbarProps } from './types.js';

	const attachmentKey = createAttachmentKey();

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

	const vertical = $derived(orientation === 'vertical');
	const isHidden = $derived(vertical ? model.hiddenState.y : model.hiddenState.x);
	const shouldRender = $derived(keepMounted || !isHidden);
	const hideTrackUntilMeasured = $derived(!model.hasMeasuredScrollbar && !keepMounted);

	let el = $state<HTMLDivElement | null>(null);
	let rendered = $state<HTMLDivElement | null>(null);

	function remember(node: HTMLDivElement) {
		rendered = node;
		return () => {
			if (rendered === node) rendered = null;
		};
	}

	$effect(() => {
		if (!shouldRender) return;
		const node = render ? rendered : el;
		if (vertical) model.scrollbarYElement = node;
		else model.scrollbarXElement = node;
		return () => {
			if (vertical) {
				if (model.scrollbarYElement === node) model.scrollbarYElement = null;
			} else if (model.scrollbarXElement === node) model.scrollbarXElement = null;
		};
	});

	$effect(() => {
		if (!shouldRender) return;
		const node = render ? rendered : el;
		if (!node) return;
		return model.listenWheel(node, vertical);
	});

	const partState = $derived({
		...model.rootState,
		hovering: model.hovering,
		scrolling: vertical ? model.scrollingY : model.scrollingX,
		orientation
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...getStateAttributesProps(partState, scrollAreaStateAttributesMapping),
		...(model.rootId ? { 'data-id': `${model.rootId}-scrollbar` } : {}),
		'aria-hidden': true,
		...elementProps,
		style: mergeCssStyle(
			toCssStyle({
				position: 'absolute',
				touchAction: 'none',
				WebkitUserSelect: 'none',
				userSelect: 'none',
				visibility: hideTrackUntilMeasured ? 'hidden' : undefined,
				...(vertical
					? {
							top: '0',
							bottom: `var(${scrollAreaCornerHeight})`,
							insetInlineEnd: '0',
							[scrollAreaThumbHeight]: `${model.thumbSize.height}px`
						}
					: {
							insetInlineStart: '0',
							insetInlineEnd: `var(${scrollAreaCornerWidth})`,
							bottom: '0',
							[scrollAreaThumbWidth]: `${model.thumbSize.width}px`
						})
			}),
			style
		),
		onpointerdown: chain((event) => model.trackPointerDown(event, vertical), onpointerdown),
		onmousedown: chain((event) => model.trackMouseDown(event), onmousedown),
		onpointerup: chain((event) => model.pointerUp(event), onpointerup),
		onpointercancel: chain((event) => model.pointerUp(event), onpointercancel),
		...(render ? { [attachmentKey]: remember } : {})
	});
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if shouldRender}
	{#if render}
		{@render render(hostProps, partState, content)}
	{:else}
		<div {...hostProps} bind:this={el}>{@render content()}</div>
	{/if}
{/if}
