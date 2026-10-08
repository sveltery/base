<!--
	A separator element accessible to screen readers. Renders a `<div>`.
	Derived from Base UI v1.8.0 packages/react/src/separator/Separator.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import PartHost from '../internal/PartHost.svelte';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import type { SeparatorProps, SeparatorState } from './types.js';

	let { orientation = 'horizontal', render, children, ...elementProps }: SeparatorProps = $props();

	const state: SeparatorState = $derived({ orientation });

	// State attributes first, then role and aria-orientation, then consumer props.
	// That is the upstream useRenderElement order: later sources override earlier ones.
	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...getStateAttributesProps(state),
		role: 'separator',
		'aria-orientation': orientation,
		...elementProps
	});
</script>

<PartHost tag="div" {render} {children} elementProps={hostProps} partState={state} />
