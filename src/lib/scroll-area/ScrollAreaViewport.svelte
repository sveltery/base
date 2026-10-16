<!--
	The actual scrollable container of the scroll area.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/scroll-area/viewport/ScrollAreaViewport.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergeCssStyle, toCssStyle } from '../internal/css-style.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { scrollAreaStateAttributesMapping } from './attributes.js';
	import { DISABLE_SCROLLBAR_CLASS } from '../internal/styles.js';
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

	function remember(node: HTMLDivElement) {
		el = node;
		return () => {
			if (el === node) el = null;
		};
	}

	$effect(() => {
		const node = el;
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
		[attachmentKey]: remember
	});

	const viewportStyle = $derived(hostProps.style);

	$effect(() => {
		model.repaint(model.viewportElement, viewportStyle);
	});

	$effect(() => {
		// Any host prop change queues a recompute, not just a new style string.
		void hostProps;
		model.queueThumb(model.hiddenState);
	});
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
