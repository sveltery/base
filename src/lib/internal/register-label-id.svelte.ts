// Derived from Base UI v1.8.0 packages/react/src/utils/useRegisteredLabelId.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// One registration. Cleanup runs on every effect pass, so unmount clears the id
// only when it is still the one this label published.

/**
 * Publishes a label id and clears it on destroy when it is still current.
 * `publishNow` writes during this render, for server HTML. The effect then
 * writes again when the id changes, and always registers the cleanup.
 * A fieldset file can re-export this function. `setLabelId` takes the next id.
 */
export function registerLabelId(
	getId: () => string | undefined,
	setLabelId: (next: string | undefined) => void,
	options?: {
		publishNow?: boolean;
		readCurrent?: () => string | undefined;
	}
) {
	const readCurrent = options?.readCurrent;

	if (options?.publishNow) setLabelId(getId());

	$effect(() => {
		const id = getId();
		setLabelId(id);
		return () => {
			if (readCurrent && readCurrent() !== id) return;
			setLabelId(undefined);
		};
	});
}
