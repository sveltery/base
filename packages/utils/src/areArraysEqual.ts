// Derived from Base UI v1.8.0 packages/utils/src/areArraysEqual.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

/** Whether both arrays hold the same items in the same order, compared with `===`. */
export function areArraysEqual<Item>(a: readonly Item[], b: readonly Item[]) {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i += 1) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}
