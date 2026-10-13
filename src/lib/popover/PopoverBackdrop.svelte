<!--
	An overlay displayed beneath the popover. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/popover/backdrop/PopoverBackdrop.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { REASONS } from '@sveltery/utils';
	import { mergeProps } from '../internal/mergeProps.js';
	import { popupTransitionStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { usePopoverRoot } from './context.svelte.js';
	import type { PopoverBackdropProps, PopoverBackdropState } from './types.js';

	let { render, children, ...elementProps }: PopoverBackdropProps = $props();

	const store = usePopoverRoot();
	const state: PopoverBackdropState = $derived({
		open: store.open,
		transitionStatus: store.transitionStatus
	});

	const hostProps = $derived(
		mergeProps(
			{
				role: 'presentation' as const,
				hidden: store.mounted ? undefined : true,
				style: `user-select: none; -webkit-user-select: none${
					store.openChangeReason === REASONS.triggerHover ? '; pointer-events: none' : ''
				}`,
				...getStateAttributesProps(state, popupTransitionStateMapping)
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
