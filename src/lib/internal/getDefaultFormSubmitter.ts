// Derived from Base UI v1.9.0 packages/utils/src/getDefaultFormSubmitter.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

export type DefaultFormSubmitter = HTMLButtonElement | HTMLInputElement;

/**
 * The default button a browser uses for implicit form submission.
 * Disabled submitters are included. Clicking one is a no-op.
 */
export function getDefaultFormSubmitter(form: HTMLFormElement | null): DefaultFormSubmitter | null {
	if (!form) return null;

	for (const candidate of form.elements) {
		if (!(candidate instanceof HTMLButtonElement || candidate instanceof HTMLInputElement))
			continue;
		if (candidate.type === 'submit') return candidate;
	}

	return null;
}
