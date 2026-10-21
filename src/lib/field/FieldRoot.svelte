<!--
	Groups all parts of the field. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/field/root/FieldRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	`validate` is an export. Bind the root with `bind:this`.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useFormContext } from '../internal/form-context.js';
	import { findFieldsetRootContext } from '../fieldset/context.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { fieldValidityMapping } from './attributes.js';
	import { setFieldContext, useFieldContext } from '../internal/field-root-context.js';
	import {
		Labelable,
		setLabelableContext,
		useLabelableContext
	} from '../internal/labelable-provider.svelte.js';
	import { FieldRootModel } from './model.svelte.js';
	import type { FieldRootProps, FieldRootState } from './types.js';

	const uid = $props.id();
	const elementKey = createAttachmentKey();

	let {
		disabled,
		name,
		validate: validateProp,
		validationMode,
		validationDebounceTime,
		invalid,
		dirty,
		touched,
		render,
		children,
		...elementProps
	}: FieldRootProps = $props();

	const form = useFormContext();
	const parentField = useFieldContext();
	const fieldset = findFieldsetRootContext();
	const parentLabelable = useLabelableContext();
	const labelable = new Labelable(parentLabelable, () => `base-ui-${uid}`, [
		'description',
		'error'
	]);
	setLabelableContext(labelable);

	const field = new FieldRootModel({
		form,
		labelable,
		parent: parentField instanceof FieldRootModel ? parentField : undefined,
		getDisabledProp: () => disabled ?? false,
		getFieldsetDisabled: () => Boolean(fieldset?.disabled),
		getName: () => name ?? undefined,
		getInvalidProp: () => invalid,
		getDirtyProp: () => dirty,
		getTouchedProp: () => touched,
		getValidationModeProp: () => validationMode,
		getValidationDebounceTime: () => validationDebounceTime,
		getValidate: () => validateProp
	});
	setFieldContext(field);

	export function validate() {
		field.validateField();
	}

	const state: FieldRootState = $derived(field.state);
	function remember(node: HTMLElement) {
		field.rootElement = node;
		return () => {
			if (field.rootElement === node) field.rootElement = null;
		};
	}

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...elementProps,
		...getStateAttributesProps(state, fieldValidityMapping),
		[elementKey]: remember
	});
</script>

{#if render}
	{@render render(hostProps as HTMLAttributes<HTMLElement>, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
