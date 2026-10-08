<!--
	Displays an element positioned against the popover anchor. Renders a `<div>`.
	Derived from Base UI v1.8.0 packages/react/src/popover/arrow/PopoverArrow.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import PartHost from '../internal/PartHost.svelte';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { popupStateMapping } from '../internal/popups/index.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { uncenteredAttribute } from './attributes.js';
	import { usePopoverPositioner, usePopoverRoot } from './context.svelte.js';
	import type { PopoverArrowProps, PopoverArrowState } from './types.js';

	let { render, children, ...elementProps }: PopoverArrowProps = $props();

	const store = usePopoverRoot();
	const positioning = usePopoverPositioner();
	const bindKey = createAttachmentKey();

	const state: PopoverArrowState = $derived({
		open: store.open,
		side: positioning.side,
		align: positioning.align,
		uncentered: positioning.arrowUncentered
	});

	const hostProps = $derived(
		mergeProps(
			{
				'aria-hidden': true as const,
				style: toCssStyle(positioning.arrowStyles),
				...getStateAttributesProps({ open: state.open, anchorHidden: false }, popupStateMapping),
				'data-side': state.side,
				'data-align': state.align,
				...(state.uncentered ? { [uncenteredAttribute]: '' } : {}),
				[bindKey]: positioning.arrowProps.attach
			},
			elementProps
		)
	);
</script>

<PartHost tag="div" {render} {children} elementProps={hostProps} partState={state} />
