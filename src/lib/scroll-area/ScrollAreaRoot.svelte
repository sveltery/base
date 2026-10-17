<!--
	Groups all parts of the scroll area. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/scroll-area/root/ScrollAreaRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Direction comes from `useDirection()`.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergeCssStyle, toCssStyle } from '../internal/css-style.js';
	import { useDirection } from '../internal/direction-context.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { scrollAreaStateAttributesMapping } from './attributes.js';
	import DisableScrollbarStyle from '../internal/DisableScrollbarStyle.svelte';
	import { setScrollAreaContext } from './context.svelte.js';
	import { scrollAreaCornerHeight, scrollAreaCornerWidth } from './css-vars.js';
	import { ScrollAreaModel } from './model.svelte.js';
	import { chain } from '../internal/mergeProps.js';
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
	const model = new ScrollAreaModel(
		() => overflowEdgeThreshold,
		() => reading.direction,
		`base-ui-${uid}`
	);
	setScrollAreaContext(model);

	let el = $state<HTMLDivElement | null>(null);

	function remember(node: HTMLDivElement) {
		el = node;
		return () => {
			if (el === node) el = null;
		};
	}

	$effect(() => {
		const node = el;
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
		[attachmentKey]: remember
	});
</script>

<DisableScrollbarStyle node={el} />
{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
