<!--
	A presentational overlay displayed beneath the popup. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/preview-card/backdrop/PreviewCardBackdrop.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { mergeProps } from '../internal/mergeProps.js';
	import { popupTransitionStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { usePreviewCardRoot } from './context.svelte.js';
	import type { PreviewCardBackdropProps, PreviewCardBackdropState } from './types.js';

	let { render, children, ...elementProps }: PreviewCardBackdropProps = $props();

	const store = usePreviewCardRoot();
	const state: PreviewCardBackdropState = $derived({
		open: store.open,
		transitionStatus: store.transitionStatus
	});

	const hostProps = $derived(
		mergeProps(
			{
				role: 'presentation' as const,
				hidden: store.mounted ? undefined : true,
				style: 'pointer-events: none; user-select: none; -webkit-user-select: none',
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
