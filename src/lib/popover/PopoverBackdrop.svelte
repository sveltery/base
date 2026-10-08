<!--
	An overlay displayed beneath the popover. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/popover/backdrop/PopoverBackdrop.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { REASONS } from '../internal/event-details.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { popupTransitionStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { usePopoverRoot } from './context.svelte.js';
	import { asHost, loose } from './loose-props.js';
	import type { PopoverBackdropProps, PopoverBackdropState } from './types.js';

	let { render, children, ...elementProps }: PopoverBackdropProps = $props();

	const store = usePopoverRoot();
	const state: PopoverBackdropState = $derived({
		open: store.open,
		transitionStatus: store.transitionStatus
	});

	const hostProps = $derived(
		asHost<HTMLDivElement>(
			mergeProps(
				loose(elementProps),
				loose({
					role: 'presentation',
					hidden: store.mounted ? undefined : true,
					style: `user-select: none; -webkit-user-select: none${
						store.openChangeReason === REASONS.triggerHover ? '; pointer-events: none' : ''
					}`,
					...getStateAttributesProps(state, popupTransitionStateMapping)
				})
			)
		)
	);
</script>

{#if render}
	{@render render(hostProps, state, content)}
{:else}
	<div {...hostProps}>{@render content()}</div>
{/if}

{#snippet content()}
	{@render children?.()}
{/snippet}
