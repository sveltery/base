// Derived from Base UI v1.8.0 packages/utils/src/getDefaultFormSubmitter.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

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
