<!--
	A viewport for displaying content transitions. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/popover/viewport/PopoverViewport.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	The current pane is keyed so `data-starting-style` lands on a new element and
	the opacity transition can run.
-->
<script lang="ts">
	import { mergeProps } from '../internal/mergeProps.js';
	import { PopupViewport } from '../internal/usePopupViewport.svelte.js';
	import { usePopoverPositioner, usePopoverRoot } from './context.svelte.js';
	import type { PopoverViewportProps, PopoverViewportState } from './types.js';

	let { render, children, ...elementProps }: PopoverViewportProps = $props();

	const store = usePopoverRoot();
	const positioning = usePopoverPositioner();
	const viewport = new PopupViewport(store, () => positioning.side);

	const partState: PopoverViewportState = $derived({
		activationDirection: viewport.activationDirection,
		transitioning: viewport.transitioning,
		instant: store.instantType
	});

	const hostProps = $derived(
		mergeProps(
			{
				...(viewport.activationDirection
					? { 'data-activation-direction': viewport.activationDirection }
					: {}),
				...(viewport.transitioning ? { 'data-transitioning': '' } : {}),
				...(store.instantType ? { 'data-instant': store.instantType } : {})
			},
			elementProps
		)
	);
</script>

{#if render}
	{@render render(hostProps, partState, content)}
{:else}
	<div {...hostProps}>{@render content()}</div>
{/if}

{#snippet content()}
	{#if viewport.previousNode}
		<div
			data-previous
			data-ending-style={viewport.showStarting ? undefined : ''}
			inert
			aria-hidden="true"
			style="position: absolute"
			{@attach viewport.mountPrevious}
		></div>
	{/if}
	{#key viewport.paneKey}
		<div
			bind:this={viewport.currentEl}
			data-current
			data-starting-style={viewport.showStarting ? '' : undefined}
		>
			{@render children?.()}
		</div>
	{/key}
{/snippet}
