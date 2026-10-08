<!--
	The movable part of the switch that indicates whether the switch is on or off.
	Renders a `<span>`.
	Derived from Base UI v1.8.0 packages/react/src/switch/thumb/SwitchThumb.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { switchStateAttributesMapping } from './attributes.js';
	import { useSwitchContext } from './context.js';
	import type { SwitchThumbProps, SwitchThumbState } from './types.js';

	let { render, children, ...elementProps }: SwitchThumbProps = $props();

	const ctx = useSwitchContext();
	const state: SwitchThumbState = $derived({
		checked: ctx.checked,
		disabled: ctx.disabled,
		readOnly: ctx.readOnly,
		required: ctx.required
	});

	const hostProps: HTMLAttributes<HTMLSpanElement> = $derived({
		...getStateAttributesProps(state, switchStateAttributesMapping),
		...elementProps
	});
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<span {...hostProps}>{@render children?.()}</span>
{/if}
