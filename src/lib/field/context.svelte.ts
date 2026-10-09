// Derived from Base UI v1.8.0 packages/react/src/field/item/FieldItemContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { getContext, hasContext, setContext } from 'svelte';
import type { FieldValidityData } from '../form/types.js';
import { DEFAULT_VALIDITY_STATE } from './constants.js';
import { DEFAULT_FIELD_STATE, type FieldContext, type FieldRootModel } from './model.svelte.js';

const FIELD_CONTEXT = Symbol('field-root');
const FIELD_ITEM_CONTEXT = Symbol('field-item');

export interface FieldItemState {
	readonly disabled: boolean;
}

export function setFieldContext(field: FieldRootModel) {
	setContext(FIELD_CONTEXT, field);
}

function frozenValidity(): FieldValidityData {
	const validity: FieldValidityData = {
		state: { ...DEFAULT_VALIDITY_STATE },
		error: '',
		errors: [],
		value: null,
		initialValue: null
	};
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
	shouldValidateOnChange: () => false,
	validateField: inert,
	registerControl: inert,
	registerInput: () => inert,
	change: inert,
	commit: inert
};

export function useFieldContext(): FieldContext {
	if (!hasContext(FIELD_CONTEXT)) return INERT_FIELD;
	return getContext<FieldRootModel>(FIELD_CONTEXT);
}

export function setFieldItemContext(item: FieldItemState) {
	setContext(FIELD_ITEM_CONTEXT, item);
}

export function useFieldItemContext(): FieldItemState {
	if (!hasContext(FIELD_ITEM_CONTEXT)) return { disabled: false };
	return getContext<FieldItemState>(FIELD_ITEM_CONTEXT);
}
