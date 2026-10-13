<!--
	Groups the input with the increment and decrement buttons.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/number-field/group/NumberFieldGroup.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { numberFieldStateAttributes } from './attributes.js';
	import { useNumberFieldContext } from './context.svelte.js';
	import type { NumberFieldGroupProps, NumberFieldGroupState } from './types.js';

	let { render, children, ...elementProps }: NumberFieldGroupProps = $props();

	const model = useNumberFieldContext();
	const state: NumberFieldGroupState = $derived(model.state);
	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		role: 'group',
		...elementProps,
		...getStateAttributesProps(state, numberFieldStateAttributes)
	});
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
