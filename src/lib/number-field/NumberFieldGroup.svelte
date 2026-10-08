<!--
	Groups the input with the increment and decrement buttons.
	Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/number-field/group/NumberFieldGroup.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import PartHost from '../internal/PartHost.svelte';
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

<PartHost tag="div" {render} {children} elementProps={hostProps} partState={state} />
