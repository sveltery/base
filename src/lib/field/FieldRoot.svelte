<!--
	Groups all parts of the field. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/field/root/FieldRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { useFormContext } from '../form/context.js';
	import { useFieldsetRootContext } from '../fieldset/context.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { fieldValidityMapping } from './attributes.js';
	import { setFieldContext } from './context.svelte.js';
	import { Labelable, setLabelableContext, useLabelableContext } from './labelable.svelte.js';
	import { FieldRootModel } from './model.svelte.js';
	import type { FieldRootActions, FieldRootProps, FieldRootState } from './types.js';

	const uid = $props.id();

	let {
		disabled = false,
		name,
		validate,
		validationMode,
		validationDebounceTime = 0,
		invalid,
		dirty,
		touched,
		actions = $bindable(),
		render,
		children,
		...elementProps
	}: FieldRootProps = $props();

	const form = useFormContext();
	const fieldset = useFieldsetRootContext(true);
	const parentLabelable = useLabelableContext(true);
	const labelable = new Labelable(parentLabelable, () => `base-ui-${uid}`);
	setLabelableContext(labelable);

	const field = new FieldRootModel({
		form,
		labelable,
		getDisabledProp: () => disabled,
		getFieldsetDisabled: () => Boolean(fieldset?.disabled),
		getName: () => name,
		getInvalidProp: () => invalid,
		getDirtyProp: () => dirty,
		getTouchedProp: () => touched,
		getValidationModeProp: () => validationMode,
		getValidationDebounceTime: () => validationDebounceTime,
		getValidate: () => validate
	});
	setFieldContext(field);

	const actionsHandle: FieldRootActions = {
		validate() {
			field.validateField();
		}
	};
	publishActions();

	function publishActions() {
		actions = actionsHandle;
		return actions.validate;
	}

	const state: FieldRootState = $derived(field.state);
	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...elementProps,
		...getStateAttributesProps(state, fieldValidityMapping)
	});
</script>

{#if render}
	{@render render(hostProps as HTMLAttributes<HTMLElement>, state)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
