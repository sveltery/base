<!--
	An accessible label that is automatically associated with the fieldset.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/fieldset/legend/FieldsetLegend.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useFieldsetRootContext } from './context.svelte.js';
	import { registerLabelId } from '../internal/register-label-id.svelte.js';
	import type { FieldsetLegendProps, FieldsetLegendState } from './types.js';

	const uid = $props.id();

	let { id: idProp, render, children, ...elementProps }: FieldsetLegendProps = $props();

	const fieldset = useFieldsetRootContext();
	const generatedId = `base-ui-${uid}`;
	const id = $derived(idProp ?? generatedId);

	registerLabelId(
		() => id,
		fieldset.setLegendId,
		() => fieldset.legendId
	);

	const state: FieldsetLegendState = $derived({
		disabled: fieldset.disabled
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...elementProps,
		...getStateAttributesProps(state),
		id
	});
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
