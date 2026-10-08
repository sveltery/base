<!--
	Groups all parts of the scroll area. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/scroll-area/root/ScrollAreaRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	The scrollbar-hiding stylesheet is a DOM element, matching the upstream style tag.
	Direction comes from `useDirection()`. The style tag takes the CSP nonce and is omitted when `disableStyleElements` is true.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useCSPContext } from '../internal/csp-context.js';
	import { mergeCssStyle, toCssStyle } from '../internal/css-style.js';
	import { useDirection } from '../internal/direction-context.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { scrollAreaStateAttributesMapping } from './attributes.js';
	import { DISABLE_SCROLLBAR_CSS } from './constants.js';
	import { setScrollAreaContext } from './context.svelte.js';
	import { scrollAreaCornerHeight, scrollAreaCornerWidth } from './css-vars.js';
	import { ScrollAreaModel } from './model.svelte.js';
	import { chain } from './style.js';
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

	const reading = useDirection();
	const csp = useCSPContext();
	const model = new ScrollAreaModel(
		() => overflowEdgeThreshold,
		() => reading.direction,
		`base-ui-${uid}`
	);
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

	$effect(() => {
		model.refreshLayout();
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
		style: mergeCssStyle(
			toCssStyle({
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

{#if csp.disableStyleElements !== true}
	<svelte:element this={"style"} nonce={csp.nonce}>{DISABLE_SCROLLBAR_CSS}</svelte:element>
{/if}
{#if render}
	{@render render(hostProps, partState, content)}
{:else}
	<div {...hostProps} bind:this={el}>{@render content()}</div>
{/if}
