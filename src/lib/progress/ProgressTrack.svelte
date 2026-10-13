<!--
	Contains the progress bar indicator.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/progress/track/ProgressTrack.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useProgressRootContext } from './ProgressRootContext.svelte.js';
	import { progressStateAttributesMapping } from './stateAttributesMapping.js';
	import type { ProgressState, ProgressTrackProps } from './types.js';

	let { render, children, ...elementProps }: ProgressTrackProps = $props();

	const context = useProgressRootContext();
	const state: ProgressState = $derived({ status: context.computed.status });

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...elementProps,
		...getStateAttributesProps(state, progressStateAttributesMapping)
	});
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
