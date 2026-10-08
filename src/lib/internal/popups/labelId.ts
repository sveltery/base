// Derived from Base UI v1.8.0 dialog and popover title/description registration
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// One owner for the title and description element ids.

export type LabelPart = 'title' | 'description';

export interface LabelIdHost {
	titleElementId?: string;
	descriptionElementId?: string;
}

/** Remember a title or description id, and clear it on unmount when it is still ours. */
export function registerLabelElementId(
	store: LabelIdHost,
	part: LabelPart,
	next: string
): () => void {
	if (part === 'title') store.titleElementId = next;
	else store.descriptionElementId = next;
	return () => {
		if (part === 'title' && store.titleElementId === next) store.titleElementId = undefined;
		if (part === 'description' && store.descriptionElementId === next) {
			store.descriptionElementId = undefined;
		}
	};
}
