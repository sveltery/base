<!--
	Displays an element positioned against the preview card anchor.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/preview-card/arrow/PreviewCardArrow.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { popupStateMapping } from '../internal/popups/index.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { usePreviewCardPositioner, usePreviewCardRoot } from './context.svelte.js';
	import type { PreviewCardArrowProps, PreviewCardArrowState } from './types.js';

	let { render, children, ...elementProps }: PreviewCardArrowProps = $props();

	const store = usePreviewCardRoot();
	const positioning = usePreviewCardPositioner();
	const bindKey = createAttachmentKey();

	const state: PreviewCardArrowState = $derived({
		open: store.open,
		side: positioning.side,
		align: positioning.align,
		uncentered: positioning.arrowUncentered
	});

	const hostProps = $derived(
		mergeProps(
			{
				style: toCssStyle(positioning.arrowStyles),
				'aria-hidden': true as const,
				...getStateAttributesProps(state, popupStateMapping),
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
