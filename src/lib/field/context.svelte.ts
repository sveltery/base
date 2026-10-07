// Derived from Base UI v1.8.0 packages/react/src/field/item/FieldItemContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { getContext, hasContext, setContext } from 'svelte';
import type { FieldRootModel } from './model.svelte.js';

const FIELD_CONTEXT = Symbol('field-root');
const FIELD_ITEM_CONTEXT = Symbol('field-item');

export interface FieldItemState {
	readonly disabled: boolean;
}

export function setFieldContext(field: FieldRootModel) {
	setContext(FIELD_CONTEXT, field);
}

export function useFieldContext(optional: true): FieldRootModel | undefined;
export function useFieldContext(optional?: false): FieldRootModel;
export function useFieldContext(optional = false) {
	if (!hasContext(FIELD_CONTEXT)) {
		if (optional) return undefined;
		throw new Error(
			'Base UI: FieldRootContext is missing. Field parts must be placed within <Field.Root>.'
		);
	}
	return getContext<FieldRootModel>(FIELD_CONTEXT);
}

export function setFieldItemContext(item: FieldItemState) {
	setContext(FIELD_ITEM_CONTEXT, item);
}

export function useFieldItemContext(): FieldItemState {
	if (!hasContext(FIELD_ITEM_CONTEXT)) return { disabled: false };
	return getContext<FieldItemState>(FIELD_ITEM_CONTEXT);
}
