<!--
	A paragraph with additional information about the field.
	Renders a `<p>` element.
	Derived from Base UI v1.8.0 packages/react/src/field/description/FieldDescription.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { fieldValidityMapping } from './attributes.js';
	import { useFieldContext, useFieldItemContext } from './context.svelte.js';
	import { useLabelableContext } from './labelable.svelte.js';
	import type { FieldDescriptionProps, FieldDescriptionState } from './types.js';

	const uid = $props.id();

	let { id: idProp, render, children, ...elementProps }: FieldDescriptionProps = $props();

	const field = useFieldContext();
	const item = useFieldItemContext();
	const labelable = useLabelableContext();
	const id = $derived(idProp ?? `base-ui-${uid}`);

	const state: FieldDescriptionState = $derived({
		...field.state,
		disabled: field.disabled || item.disabled
	});

	$effect(() => {
		const messageId = id;
		if (!messageId) return;
		labelable.setMessageIds((current) => current.concat(messageId));
		return () => {
			labelable.setMessageIds((current) => current.filter((itemId) => itemId !== messageId));
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
