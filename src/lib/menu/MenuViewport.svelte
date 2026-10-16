<!--
	A viewport for displaying content transitions.
	This component is only required if one popup can be opened by multiple triggers, its content
	changes based on the trigger, and switching between them is animated.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/menu/viewport/MenuViewport.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The current pane is keyed so `data-starting-style` lands on a new element.
-->
<script lang="ts">
	import { mergeProps } from '../internal/mergeProps.js';
	import { PopupViewport } from '../internal/usePopupViewport.svelte.js';
	import { useMenuPositioner, useMenuRoot } from './context.svelte.js';
	import type { MenuViewportProps, MenuViewportState } from './types.js';

	let { render, children, ...elementProps }: MenuViewportProps = $props();

	const { store } = useMenuRoot();
	const positioning = useMenuPositioner();
	const viewport = new PopupViewport(store, () => positioning.side);

	const partState: MenuViewportState = $derived({
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
