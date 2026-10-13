// Derived from Base UI v1.9.0 packages/utils/src/areArraysEqual.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

/** Whether both arrays hold the same items in the same order, compared with `===`. */
export function areArraysEqual<Item>(a: readonly Item[], b: readonly Item[]) {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i += 1) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}
