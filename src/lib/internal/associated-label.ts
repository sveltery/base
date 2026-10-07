// Derived from the fallback path of Base UI v1.8.0
// packages/react/src/internals/labelable-provider/useAriaLabelledBy.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Field's labelable provider is not ported. This is the native <label> fallback only.

type LabelSource = HTMLElement & { labels?: NodeListOf<HTMLLabelElement> | null };

/** The native label associated with the hidden input, if one is in the document. */
export function findAssociatedLabel(source: LabelSource | null): HTMLLabelElement | undefined {
	if (!source) return undefined;

	const parent = source.parentElement;
	if (parent instanceof HTMLLabelElement) return parent;

	const controlId = source.id;
	if (controlId) {
		const nextSibling = source.nextElementSibling;
		if (nextSibling instanceof HTMLLabelElement && nextSibling.htmlFor === controlId) {
			return nextSibling;
		}
	}

	const labels = source.labels;
	return labels?.[0];
}
