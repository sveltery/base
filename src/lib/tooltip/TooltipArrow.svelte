<!--
	Displays an element positioned against the tooltip anchor. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/tooltip/arrow/TooltipArrow.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { popupStateMapping } from '../internal/popups/index.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useTooltipPositioner, useTooltipRoot } from './context.svelte.js';
	import type { TooltipArrowProps, TooltipArrowState } from './types.js';

	let { render, children, ...elementProps }: TooltipArrowProps = $props();

	const store = useTooltipRoot();
	const positioning = useTooltipPositioner();
	const bindKey = createAttachmentKey();

	const state: TooltipArrowState = $derived({
		open: store.open,
		side: positioning.side,
		align: positioning.align,
		uncentered: positioning.arrowUncentered,
		instant: store.instantType
	});

	const hostProps = $derived(
		mergeProps(
			{
				'aria-hidden': true as const,
				style: toCssStyle(positioning.arrowStyles),
				...getStateAttributesProps({ open: state.open, anchorHidden: false }, popupStateMapping),
				'data-side': state.side,
				'data-align': state.align,
				...(state.uncentered ? { 'data-uncentered': '' } : {}),
				...(state.instant ? { 'data-instant': state.instant } : {}),
				[bindKey]: positioning.arrowProps.attach
			},
			elementProps
		)
	);
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
