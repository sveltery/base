<!--
	Groups individual items in a checkbox group or radio group with a label and description.
	Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/field/item/FieldItem.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { fieldValidityMapping } from './attributes.js';
	import { needFieldContext } from '../internal/field-root-context.js';
	import { setFieldItemContext } from './item-context.js';
	import {
		Labelable,
		setLabelableContext,
		useLabelableContext
	} from '../internal/labelable-provider.svelte.js';
	import type { FieldItemProps, FieldItemState } from './types.js';

	const uid = $props.id();

	let { disabled: disabledProp, render, children, ...elementProps }: FieldItemProps = $props();

	const field = needFieldContext();
	const parentLabelable = useLabelableContext();
	const labelable = new Labelable(parentLabelable, () => `base-ui-${uid}`);
	setLabelableContext(labelable);

	const disabled = $derived(field.disabled || (disabledProp ?? false));
	setFieldItemContext({
		get disabled() {
			return disabled;
		}
	});

	const state: FieldItemState = $derived({
		...field.state,
		disabled
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...elementProps,
		...getStateAttributesProps(state, fieldValidityMapping)
	});
</script>

{#if render}
	{@render render(hostProps as HTMLAttributes<HTMLElement>, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
