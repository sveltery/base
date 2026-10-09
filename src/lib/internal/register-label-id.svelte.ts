// Derived from Base UI v1.8.0 packages/react/src/utils/useRegisteredLabelId.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// One registration. Cleanup runs on every effect pass, so unmount clears the id
// only when it is still the one this label published.

import { untrack } from 'svelte';

/**
 * Publishes a label id and clears it on destroy when it is still current.
 * `publishNow` writes during this render, for server HTML. The effect then
 * writes again only when `readCurrent` says the id changed, and always
 * registers the cleanup. The setter receives the next id, not an updater.
 */
export function registerLabelId(
	getId: () => string | undefined,
	setLabelId: (next: string | undefined) => void,
	options?: {
		publishNow?: boolean;
		readCurrent?: () => string | undefined;
	}
) {
	if (options?.publishNow) {
		untrack(() => {
			setLabelId(getId());
		});
	}

	const readCurrent = options?.readCurrent;

	$effect(() => {
		const id = getId();
		if (!readCurrent || untrack(readCurrent) !== id) setLabelId(id);
		return () => {
			if (readCurrent && untrack(readCurrent) !== id) return;
			setLabelId(undefined);
		};
	});
}
