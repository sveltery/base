// Derived from Base UI v1.9.0 packages/react/src/internals/field-root-context/FieldRootContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import type { FieldValidityData } from '../form/types.js';
import { DEFAULT_FIELD_STATE, EMPTY_VALIDITY, type FieldContext } from '../field/model.svelte.js';
import { defineOptionalContext } from './context.js';

function frozenValidity(): FieldValidityData {
	const validity = EMPTY_VALIDITY();
	Object.freeze(validity.state);
	Object.freeze(validity.errors);
	Object.freeze(validity);
	return validity;
}

const INERT_VALIDITY = frozenValidity();

function inert() {}

/**
 * Shared fallback when a part reads the field outside `<Field.Root>`.
 * Setters and registration do nothing, matching upstream's default field context.
 * A standalone `Input` still mounts. It does not validate, join form values,
 * or set `data-focused`, `data-dirty`, `data-filled`, or `data-touched`.
 */
const INERT_FIELD: FieldContext = {
	validityData: INERT_VALIDITY,
	disabled: false,
	name: undefined,
	validationMode: 'onSubmit',
	invalid: false,
	formError: null,
	hasFormError: false,
	dirty: false,
	touched: false,
	valid: null,
	filled: false,
	focused: false,
	state: DEFAULT_FIELD_STATE,
	inputElement: null,
	setTouched: inert,
	setDirty: inert,
	setFilled: inert,
	setFocused: inert,
	focusOwner: undefined,
	shouldValidateOnChange: () => false,
	validateField: inert,
	registerControl: inert,
	registerInput: () => inert,
	change: inert,
	commit: inert,
	binding: undefined,
	controlType: undefined
};

export const [useFieldContext, setFieldContext, needFieldContext] =
	defineOptionalContext<FieldContext>(
		INERT_FIELD,
		'Base UI: FieldRootContext is missing. Field parts must be placed within <Field.Root>.'
	);
