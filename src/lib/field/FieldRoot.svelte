<!--
	Groups all parts of the field. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/field/root/FieldRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	`validate` is an export. Bind the root with `bind:this`.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { useFormContext } from '../internal/form-context.js';
	import { findFieldsetRootContext } from '../fieldset/context.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { fieldValidityMapping } from './attributes.js';
	import { setFieldContext } from '../internal/field-root-context.js';
	import {
		Labelable,
		setLabelableContext,
		useLabelableContext
	} from '../internal/labelable-provider.svelte.js';
	import { FieldRootModel } from './model.svelte.js';
	import type { FieldRootProps, FieldRootState } from './types.js';

	const uid = $props.id();

	let {
		disabled,
		name,
		validate: validateProp,
		validationMode,
		validationDebounceTime = 0,
		invalid,
		dirty,
		touched,
		render,
		children,
		...elementProps
	}: FieldRootProps = $props();

	const form = useFormContext();
	const fieldset = findFieldsetRootContext();
	const parentLabelable = useLabelableContext();
	const labelable = new Labelable(parentLabelable, () => `base-ui-${uid}`);
	setLabelableContext(labelable);

	const field = new FieldRootModel({
		form,
		labelable,
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
