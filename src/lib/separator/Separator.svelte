<!--
	A separator element accessible to screen readers. Renders a `<div>`.
	Derived from Base UI v1.9.0 packages/react/src/separator/Separator.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
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

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
