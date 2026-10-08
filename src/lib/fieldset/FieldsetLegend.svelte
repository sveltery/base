<!--
	An accessible label that is automatically associated with the fieldset.
	Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/fieldset/legend/FieldsetLegend.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import PartHost from '../internal/PartHost.svelte';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useFieldsetRootContext } from './context.svelte.js';
	import { registerLabelId } from './register-label-id.svelte.js';
	import type { FieldsetLegendProps, FieldsetLegendState } from './types.js';

	const uid = $props.id();

	let { id: idProp, render, children, ...elementProps }: FieldsetLegendProps = $props();

	const fieldset = useFieldsetRootContext();
	const generatedId = `base-ui-${uid}`;
	const id = $derived(idProp ?? generatedId);

	registerLabelId(() => id, fieldset.setLegendId);

	const state: FieldsetLegendState = $derived({
		disabled: fieldset.disabled
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...elementProps,
		...getStateAttributesProps(state),
		id
	});
</script>

<PartHost tag="div" {render} {children} elementProps={hostProps} partState={state} />
