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
 * A part that renders its own field-aware controls sets it as the context to detach them from
 * the surrounding `<Field.Root>`.
 */
export const DEFAULT_FIELD_ROOT_CONTEXT: FieldContext = {
	validityData: INERT_VALIDITY,
	disabled: false,
	name: undefined,
	validationMode: 'onSubmit',
	invalid: false,
	path: undefined,
	issues: Object.freeze([]),
	externalErrors: Object.freeze([]),
	hasExternalErrors: false,
	clearExternalErrors: inert,
	bindRemote: () => undefined,
	remoteValue: undefined,
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
	registeredInputs: new Map(),
	change: inert,
	commit: inert
};

export const [useFieldContext, setFieldContext, needFieldContext] =
	defineOptionalContext<FieldContext>(
		DEFAULT_FIELD_ROOT_CONTEXT,
		'Base UI: FieldRootContext is missing. Field parts must be placed within <Field.Root>.'
	);
