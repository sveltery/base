// Derived from Base UI v1.9.0 packages/react/src/field/item/FieldItemContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { defineOptionalContext } from '../internal/context.js';

export interface FieldItemState {
	readonly disabled: boolean;
}

export const [useFieldItemContext, setFieldItemContext] = defineOptionalContext<FieldItemState>({
	disabled: false
});
