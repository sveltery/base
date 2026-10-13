// Derived from Base UI v1.8.0 packages/react/src/field/item/FieldItemContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { defineOptionalContext } from '../internal/context.js';

export interface FieldItemState {
	readonly disabled: boolean;
}

export const [useFieldItemContext, setFieldItemContext] = defineOptionalContext<FieldItemState>({
	disabled: false
});
