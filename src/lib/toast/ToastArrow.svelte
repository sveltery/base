<!--
	Displays an element positioned against the toast anchor. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/toast/arrow/ToastArrow.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useToastPositioner } from './context.js';
	import type { ToastArrowProps, ToastArrowState } from './types.js';

	let { render, children, ...elementProps }: ToastArrowProps = $props();

	const positioning = useToastPositioner();
	const bindKey = createAttachmentKey();

	const state: ToastArrowState = $derived({
		side: positioning.side,
		align: positioning.align,
		uncentered: positioning.arrowUncentered
	});

	const hostProps = $derived(
		mergeProps(
			{
				'aria-hidden': true as const,
				style: toCssStyle(positioning.arrowStyles),
				...getStateAttributesProps(state),
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
