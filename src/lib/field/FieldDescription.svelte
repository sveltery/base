<!--
	A paragraph with additional information about the field.
	Renders a `<p>` element.
	Derived from Base UI v1.9.0 packages/react/src/field/description/FieldDescription.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { fieldValidityMapping } from './attributes.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { useFieldItemContext } from './item-context.js';
	import { useLabelableContext } from '../internal/labelable-provider.svelte.js';
	import type { FieldDescriptionProps, FieldDescriptionState } from './types.js';

	const uid = $props.id();

	let { id: idProp, render, children, ...elementProps }: FieldDescriptionProps = $props();

	const field = useFieldContext();
	const item = useFieldItemContext();
	const labelable = useLabelableContext();
	// The first description takes the id the control already lists, so the server HTML pairs them.
	const reservedId = labelable.claimReservedId('description');
	onDestroy(() => {
		if (reservedId) labelable.releaseReservedId('description');
	});
	const id = $derived(idProp ?? reservedId ?? `base-ui-${uid}`);

	const state: FieldDescriptionState = $derived({
		...field.state,
		disabled: field.disabled || item.disabled
	});

	$effect(() => {
		const messageId = id;
		if (!messageId || messageId === reservedId) return;
		labelable.addMessageId(messageId);
		return () => {
			labelable.deleteMessageId(messageId);
		};
	});

	const hostProps: HTMLAttributes<HTMLParagraphElement> = $derived({
		...elementProps,
		...getStateAttributesProps(state, fieldValidityMapping),
		id
	});
</script>

{#if render}
	{@render render(hostProps as HTMLAttributes<HTMLElement>, state, children)}
{:else}
	<p {...hostProps}>{@render children?.()}</p>
{/if}
