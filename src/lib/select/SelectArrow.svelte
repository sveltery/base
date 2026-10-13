<!--
	Displays an element positioned against the select anchor. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/select/arrow/SelectArrow.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Nothing renders while the popup overlaps the trigger.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useSelectPositioner, useSelectRoot } from './context.svelte.js';
	import type { SelectArrowProps, SelectArrowState } from './types.js';

	let { render, children, ...elementProps }: SelectArrowProps = $props();

	const store = useSelectRoot();
	const positioner = useSelectPositioner();
	const bindKey = createAttachmentKey();

	const partState: SelectArrowState = $derived({
		open: store.open,
		side: positioner.side,
		align: positioner.align,
		uncentered: positioner.positioning.arrowUncentered
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived(
		mergeProps(
			{
				style: toCssStyle(positioner.positioning.arrowStyles),
				'aria-hidden': true as const,
				...getStateAttributesProps(partState, {
					open: (open): Record<string, string> => (open ? { 'data-open': '' } : { 'data-closed': '' })
				}),
				[bindKey]: positioner.positioning.arrowProps.attach
			},
			elementProps
		)
	);
</script>

{#if !positioner.alignItemWithTriggerActive}
	{#if render}
		{@render render(hostProps, partState, children)}
	{:else}
		<div {...hostProps}>{@render children?.()}</div>
	{/if}
{/if}
