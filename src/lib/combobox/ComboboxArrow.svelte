<!--
	Displays an element positioned against the anchor. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/arrow/ComboboxArrow.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { popupStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useComboboxPositioner, useComboboxRoot } from './context.svelte.js';
	import type { ComboboxArrowProps, ComboboxArrowState } from './types.js';

	let { render, children, ...elementProps }: ComboboxArrowProps = $props();

	const store = useComboboxRoot();
	const positioning = useComboboxPositioner();
	const bindKey = createAttachmentKey();

	const partState: ComboboxArrowState = $derived({
		open: store.open,
		side: positioning.side,
		align: positioning.align,
		uncentered: positioning.arrowUncentered
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived(
		mergeProps(
			{
				style: toCssStyle(positioning.arrowStyles),
				'aria-hidden': true as const,
				...getStateAttributesProps({ ...partState, anchorHidden: false }, popupStateMapping),
				[bindKey]: positioning.arrowProps.attach
			},
			elementProps
		)
	);
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
