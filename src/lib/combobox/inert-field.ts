// Derived from Base UI v1.9.0 packages/react/src/internals/field-root-context/FieldRootContext.ts
// (DEFAULT_FIELD_ROOT_CONTEXT, commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see
// THIRD_PARTY_NOTICES.md.
import { DEFAULT_FIELD_STATE, EMPTY_VALIDITY, type FieldContext } from '../field/model.svelte.js';

function inert() {}

/**
 * The field a field-aware input inside the popup reads, so the trigger stays the field's control.
 * A copy of the unexported fallback in `internal/field-root-context.ts`.
 */
export const INERT_FIELD: FieldContext = {
	validityData: EMPTY_VALIDITY(),
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
