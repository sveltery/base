<!--
	The scrollable container of the scroll area. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/scroll-area/viewport/ScrollAreaViewport.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergeCssStyle, toCssStyle } from '../internal/css-style.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { scrollAreaStateAttributesMapping } from './attributes.js';
	import { DISABLE_SCROLLBAR_CLASS } from './constants.js';
	import { setScrollAreaViewportContext, useScrollAreaRootContext } from './context.svelte.js';
	import { chain, mergeClass } from '../internal/mergeProps.js';
	import type { ScrollAreaViewportProps } from './types.js';

	const attachmentKey = createAttachmentKey();

	let {
		class: className,
		style,
		onscroll,
		onwheel,
		onpointermove,
		onpointerenter,
		onkeydown,
		render,
		children,
		...elementProps
	}: ScrollAreaViewportProps = $props();

	const model = useScrollAreaRootContext();
	setScrollAreaViewportContext(model);

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
		model.viewportElement = node;
		return () => {
			if (model.viewportElement === node) model.viewportElement = null;
		};
	});

	$effect(() => {
		model.registerOverflowProperties();
	});

	$effect(() => {
		model.observeViewportHover();
	});

	$effect(() => {
		return model.observeViewportSize();
	});

	const partState = $derived(model.rootState);

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...getStateAttributesProps(partState, scrollAreaStateAttributesMapping),
		role: 'presentation',
		...(model.rootId ? { 'data-id': `${model.rootId}-viewport` } : {}),
		tabindex: model.hiddenState.x && model.hiddenState.y ? -1 : 0,
		...elementProps,
		class: mergeClass(DISABLE_SCROLLBAR_CLASS, className),
		style: mergeCssStyle(
			mergeCssStyle(toCssStyle({ overflow: 'scroll' }), style),
			toCssStyle({ scrollSnapType: model.snapSuspended ? 'none' : undefined })
		),
		onscroll: chain(() => model.viewportScroll(), onscroll),
		onwheel: chain(() => model.markUserInteraction(), onwheel),
		onpointermove: chain(() => model.markUserInteraction(), onpointermove),
		onpointerenter: chain(() => model.markUserInteraction(), onpointerenter),
		onkeydown: chain(() => model.markUserInteraction(), onkeydown),
		...(render ? { [attachmentKey]: remember } : {})
	});

	$effect(() => {
		model.queueThumb(model.hiddenState, hostProps.style);
	});
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps} bind:this={el}>{@render children?.()}</div>
{/if}
