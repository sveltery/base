<!--
	Contains the progress bar indicator.
	Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/progress/track/ProgressTrack.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import PartHost from '../internal/PartHost.svelte';
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

<PartHost tag="div" {render} {children} elementProps={hostProps} partState={state} />
