<!--
	Groups all parts of the scroll area. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/scroll-area/root/ScrollAreaRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	The scrollbar-hiding stylesheet is a DOM element, matching the upstream style tag.
	Direction follows the root element's used CSS direction. DirectionProvider is not ported.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { scrollAreaStateAttributesMapping } from './attributes.js';
	import { DISABLE_SCROLLBAR_CSS } from './constants.js';
	import { setScrollAreaContext } from './context.svelte.js';
	import { scrollAreaCornerHeight, scrollAreaCornerWidth } from './css-vars.js';
	import { ScrollAreaModel } from './model.svelte.js';
	import { chain, cssText, joinStyles } from './style.js';
	import type { ScrollAreaRootProps } from './types.js';

	const uid = $props.id();
	const attachmentKey = createAttachmentKey();

	let {
		overflowEdgeThreshold,
		style,
		dir,
		onpointerenter,
		onpointermove,
		onpointerdown,
		onpointerleave,
		render,
		children,
		...elementProps
	}: ScrollAreaRootProps = $props();

	const model = new ScrollAreaModel(() => overflowEdgeThreshold, `base-ui-${uid}`);
	setScrollAreaContext(model);

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
		model.rootElement = node;
		return () => {
			if (model.rootElement === node) model.rootElement = null;
		};
	});

	function refreshRoot(
		_style: typeof style,
		_dir: typeof dir,
		_threshold: typeof overflowEdgeThreshold
	) {
		model.syncDirection();
		model.bumpLayout();
	}

	$effect(() => {
		refreshRoot(style, dir, overflowEdgeThreshold);
	});

	$effect(() => {
		return () => model.dispose();
	});

	const partState = $derived(model.rootState);

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...getStateAttributesProps(partState, scrollAreaStateAttributesMapping),
		role: 'presentation',
		...elementProps,
		dir,
		style: joinStyles(
			cssText({
				position: 'relative',
				[scrollAreaCornerHeight]: `${model.cornerSize.height}px`,
				[scrollAreaCornerWidth]: `${model.cornerSize.width}px`
			}),
			style
		),
		onpointerenter: chain((event) => model.pointerEnterOrMove(event), onpointerenter),
		onpointermove: chain((event) => model.pointerEnterOrMove(event), onpointermove),
		onpointerdown: chain((event) => model.pointerDownRoot(event), onpointerdown),
		onpointerleave: chain(() => model.pointerLeave(), onpointerleave),
		...(render ? { [attachmentKey]: remember } : {})
	});
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

<svelte:element this={"style"}>{DISABLE_SCROLLBAR_CSS}</svelte:element>
{#if render}
	{@render render(hostProps, partState, content)}
{:else}
	<div {...hostProps} bind:this={el}>{@render content()}</div>
{/if}
