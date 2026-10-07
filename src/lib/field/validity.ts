// Derived from Base UI v1.8.0 packages/react/src/field/utils/getCombinedFieldValidityData.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { FieldValidityData } from '../form/types.js';

/**
 * Combines the field's client-side validity with external invalidity
 * (`invalid` or a Form error) to produce the validity Form reads.
 */
export function getCombinedFieldValidityData(
	validityData: FieldValidityData,
	invalid: boolean | undefined
): FieldValidityData {
	return {
		...validityData,
		state: {
			...validityData.state,
			valid: !invalid && validityData.state.valid
		}
	};
}

/** An input that can carry a native ValidityState. */
export function isConstraintElement(
	element: HTMLElement | null
): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
	return (
		element instanceof HTMLInputElement ||
		element instanceof HTMLTextAreaElement ||
		element instanceof HTMLSelectElement
	);
}

/**
 * Whether an input participates in the surrounding Form. Disabled inputs, and inputs
 * whose `form` attribute points at a different form, are excluded. An unassociated
 * portaled input still belongs to the contextual form.
 */
export function isEligibleInput(input: HTMLInputElement, formElement: HTMLFormElement | null) {
	if (input.matches(':disabled')) return false;
	if (!formElement || input.form === formElement) return true;
	return input.form === null && !input.hasAttribute('form');
}
