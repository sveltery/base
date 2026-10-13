<!--
	A viewport for displaying content transitions. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/preview-card/viewport/PreviewCardViewport.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The current pane is keyed so `data-starting-style` lands on a new element and
	the opacity transition can run.
-->
<script lang="ts">
	import { mergeProps } from '../internal/mergeProps.js';
	import { PopupViewport } from '../internal/usePopupViewport.svelte.js';
	import { usePreviewCardPositioner, usePreviewCardRoot } from './context.svelte.js';
	import type { PreviewCardViewportProps, PreviewCardViewportState } from './types.js';

	let { render, children, ...elementProps }: PreviewCardViewportProps = $props();

	const store = usePreviewCardRoot();
	const positioning = usePreviewCardPositioner();
	const viewport = new PopupViewport(store, () => positioning.side);

	const partState: PreviewCardViewportState = $derived({
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
